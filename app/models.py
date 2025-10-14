from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    transactions: list["Transaction"] = Relationship(back_populates="user")
    categories: list["Category"] = Relationship(back_populates="user")
    budgets: list["Budget"] = Relationship(back_populates="user")


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = Field(description="income or expense")
    icon: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")

    user: Optional[User] = Relationship(back_populates="categories")
    transactions: list["Transaction"] = Relationship(back_populates="category")


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    description: str
    amount: float
    type: str = Field(description="income or expense")
    date: date = Field(default_factory=date.today)

    user_id: int = Field(foreign_key="user.id")
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")

    user: Optional[User] = Relationship(back_populates="transactions")
    category: Optional[Category] = Relationship(back_populates="transactions")


class Budget(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    period: str = Field(default="monthly", description="e.g., daily/weekly/monthly/quarterly/yearly")
    limit_amount: float = Field(default=0.0)

    month: Optional[int] = None
    year: Optional[int] = None
    amount: Optional[float] = None

    user_id: int = Field(foreign_key="user.id")

    user: Optional[User] = Relationship(back_populates="budgets")


class AdviceRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    prompt: str
    response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
