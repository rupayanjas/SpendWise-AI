from __future__ import annotations

"""Budgets router for SpendWise AI.

Endpoints:
- GET /budgets: List budgets for the authenticated user
- GET /budgets/{id}: Get a single budget
- POST /budgets: Create a budget (category_id, period, limit_amount)
- PUT /budgets/{id}: Update a budget
- DELETE /budgets/{id}: Delete a budget
"""

from typing import Annotated, List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db import get_session
from app.models import Budget, User
from app.routers.auth import get_current_user
from app.schemas import BudgetCreate, BudgetRead, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=List[BudgetRead])
async def list_budgets(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all budgets for the authenticated user."""
    result = await session.execute(
        select(Budget).where(Budget.user_id == current_user.id).order_by(Budget.id.desc())
    )
    return result.scalars().all()


@router.get("/{budget_id}", response_model=BudgetRead)
async def get_budget(
    budget_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieve a single budget by id."""
    result = await session.execute(
        select(Budget).where(and_(Budget.id == budget_id, Budget.user_id == current_user.id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


@router.post("/", response_model=BudgetRead, status_code=201)
async def create_budget(
    data: BudgetCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new budget for the authenticated user."""
    budget = Budget(**data.model_dump(), user_id=current_user.id)

    # Option A compatibility: populate legacy fields for analytics summary
    if (budget.period or "").lower() == "monthly" and budget.category_id is None:
        today = date.today()
        budget.month = today.month
        budget.year = today.year
        budget.amount = budget.limit_amount

    session.add(budget)
    await session.commit()
    await session.refresh(budget)
    return budget


@router.put("/{budget_id}", response_model=BudgetRead)
async def update_budget(
    budget_id: int,
    updates: BudgetUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an existing budget by id for the authenticated user."""
    result = await session.execute(
        select(Budget).where(and_(Budget.id == budget_id, Budget.user_id == current_user.id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    data = updates.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(budget, k, v)

    # Option A compatibility on update as well
    effective_period = (budget.period or "").lower()
    if effective_period == "monthly" and budget.category_id is None:
        today = date.today()
        budget.month = today.month
        budget.year = today.year
        budget.amount = budget.limit_amount

    session.add(budget)
    await session.commit()
    await session.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a budget for the authenticated user."""
    result = await session.execute(
        select(Budget).where(and_(Budget.id == budget_id, Budget.user_id == current_user.id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    await session.delete(budget)
    await session.commit()
    return None
