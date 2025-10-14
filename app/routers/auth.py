from __future__ import annotations

"""Authentication router for SpendWise AI.

Endpoints:
- POST /register: Create user and return JWT + user info
- POST /login: Authenticate user and return JWT + user info
- GET /me: Get current authenticated user
- PUT /me: Update current user profile (name/email/password)
"""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db import get_session
from app.models import User
from app.schemas import LoginRequest, Token, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Resolve the current user from a Bearer JWT token."""
    from jose import JWTError, jwt
    from app.core.security import JWT_SECRET, JWT_ALGORITHM

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=dict, status_code=201)
async def register(
    user_in: UserCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Register a new user.

    - Validates email uniqueness
    - Hashes password
    - Returns JWT and user info
    """
    existing = await session.execute(select(User).where(User.email == user_in.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(subject=user.email, expires_delta=timedelta(days=1))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserRead.model_validate(user),
    }


@router.post("/login", response_model=dict)
async def login(
    payload: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Authenticate a user and return JWT + user profile."""
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=user.email, expires_delta=timedelta(days=1))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserRead.model_validate(user),
    }


@router.get("/me", response_model=UserRead)
async def read_me(current_user: Annotated[User, Depends(get_current_user)]):
    """Return the authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserRead)
async def update_me(
    updates: UserUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update the authenticated user's profile.

    - Allows updating full_name, email, and/or password
    - Validates email uniqueness when changed
    - Re-hashes password when changed
    """
    # Email change uniqueness check
    if updates.email and updates.email != current_user.email:
        exists = await session.execute(select(User).where(User.email == updates.email))
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = updates.email

    if updates.full_name is not None:
        current_user.full_name = updates.full_name

    if updates.password:
        current_user.hashed_password = get_password_hash(updates.password)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user
