from __future__ import annotations

"""Categories router for SpendWise AI.

Endpoints:
- GET /categories: List user's categories
- POST /categories: Create a category (name, icon, type)
- PUT /categories/{id}: Update a category
- DELETE /categories/{id}: Delete a category
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db import get_session
from app.models import Category, User
from app.routers.auth import get_current_user
from app.schemas import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryRead])
async def list_categories(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all categories belonging to the authenticated user."""
    result = await session.execute(
        select(Category).where(Category.user_id == current_user.id).order_by(Category.name)
    )
    return result.scalars().all()


@router.post("/", response_model=CategoryRead, status_code=201)
async def create_category(
    data: CategoryCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new category for the authenticated user."""
    cat = Category(**data.model_dump(), user_id=current_user.id)
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int,
    updates: CategoryUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a user's category by id."""
    result = await session.execute(
        select(Category).where(and_(Category.id == category_id, Category.user_id == current_user.id))
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    data = updates.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(cat, k, v)

    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a user's category by id."""
    result = await session.execute(
        select(Category).where(and_(Category.id == category_id, Category.user_id == current_user.id))
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    await session.delete(cat)
    await session.commit()
    return None
