from __future__ import annotations

"""Transactions router for SpendWise AI.

Endpoints:
- GET /transactions: List user's transactions with optional filters
- GET /transactions/{id}: Retrieve a single transaction
- POST /transactions: Create a transaction
- PUT /transactions/{id}: Update a transaction
- DELETE /transactions/{id}: Delete a transaction
"""

from datetime import date
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db import get_session
from app.models import Transaction, User
from app.routers.auth import get_current_user
from app.schemas import TransactionCreate, TransactionRead, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[TransactionRead])
async def list_transactions(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    type: Optional[str] = Query(default=None, pattern="^(income|expense)$"),
    category_id: Optional[int] = Query(default=None),
):
    """List transactions for the authenticated user with optional filters.

    Filters:
    - start_date/end_date: inclusive date range
    - type: "income" or "expense"
    - category_id: filter by category
    """
    conditions = [Transaction.user_id == current_user.id]

    if start_date:
        conditions.append(Transaction.date >= start_date)
    if end_date:
        conditions.append(Transaction.date <= end_date)
    if type:
        conditions.append(Transaction.type == type)
    if category_id is not None:
        conditions.append(Transaction.category_id == category_id)

    stmt = select(Transaction).where(and_(*conditions)).order_by(Transaction.date.desc(), Transaction.id.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{txn_id}", response_model=TransactionRead)
async def get_transaction(
    txn_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieve a transaction by id for the authenticated user."""
    result = await session.execute(
        select(Transaction).where(and_(Transaction.id == txn_id, Transaction.user_id == current_user.id))
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@router.post("/", response_model=TransactionRead, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new transaction for the authenticated user."""
    txn = Transaction(**data.model_dump(), user_id=current_user.id)
    session.add(txn)
    await session.commit()
    await session.refresh(txn)
    return txn


@router.put("/{txn_id}", response_model=TransactionRead)
async def update_transaction(
    txn_id: int,
    updates: TransactionUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an existing transaction for the authenticated user."""
    result = await session.execute(
        select(Transaction).where(and_(Transaction.id == txn_id, Transaction.user_id == current_user.id))
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    data = updates.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(txn, k, v)

    session.add(txn)
    await session.commit()
    await session.refresh(txn)
    return txn


@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a transaction for the authenticated user."""
    result = await session.execute(
        select(Transaction).where(and_(Transaction.id == txn_id, Transaction.user_id == current_user.id))
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    await session.delete(txn)
    await session.commit()
    return None
