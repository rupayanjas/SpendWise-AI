from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db import get_session
from app.models import Budget, Category, Transaction, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get financial summary for the authenticated user."""
    q_income = select(func.sum(Transaction.amount)).where(
        and_(Transaction.user_id == current_user.id, Transaction.type == "income")
    )
    q_expense = select(func.sum(Transaction.amount)).where(
        and_(Transaction.user_id == current_user.id, Transaction.type == "expense")
    )
    res_income = await session.execute(q_income)
    res_expense = await session.execute(q_expense)
    total_income = float(res_income.scalar() or 0)
    total_expense = float(res_expense.scalar() or 0)
    balance = total_income - total_expense

    today = date.today()
    budget_res = await session.execute(
        select(Budget).where(
            and_(Budget.user_id == current_user.id, Budget.year == today.year, Budget.month == today.month)
        )
    )
    budget = budget_res.scalar_one_or_none()

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "budget": budget.amount if budget else None,
    }


@router.get("/by-category")
async def by_category(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get spending breakdown by category."""
    q = (
        select(Category.name, func.sum(Transaction.amount))
        .join(Transaction, Transaction.category_id == Category.id)
        .where(and_(Transaction.user_id == current_user.id, Transaction.type == "expense"))
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
    )
    res = await session.execute(q)
    return [{"category": name, "amount": float(total or 0)} for name, total in res.all()]


@router.get("/savings-rate")
async def savings_rate(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Calculate savings rate for the authenticated user."""
    q_income = select(func.sum(Transaction.amount)).where(
        and_(Transaction.user_id == current_user.id, Transaction.type == "income")
    )
    q_expense = select(func.sum(Transaction.amount)).where(
        and_(Transaction.user_id == current_user.id, Transaction.type == "expense")
    )
    res_income = await session.execute(q_income)
    res_expense = await session.execute(q_expense)
    total_income = float(res_income.scalar() or 0)
    total_expense = float(res_expense.scalar() or 0)
    rate = (max(total_income - total_expense, 0) / total_income * 100) if total_income > 0 else 0
    return {"savings_rate": rate}
