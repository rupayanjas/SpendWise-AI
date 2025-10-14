from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field as PydField


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Categories
class CategoryBase(BaseModel):
    name: str
    type: str
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    icon: Optional[str] = None


class CategoryRead(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# Transactions
class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str
    date: date
    category_id: int | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    date: Optional[date] = None
    category_id: int | None = None


class TransactionRead(TransactionBase):
    id: int

    class Config:
        from_attributes = True


# Budgets (category-based)
class BudgetBase(BaseModel):
    category_id: int | None = None
    period: str = "monthly"
    limit_amount: float


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    period: Optional[str] = None
    limit_amount: Optional[float] = None


class BudgetRead(BudgetBase):
    id: int

    class Config:
        from_attributes = True


# Advice
class AdviceRequestSchema(BaseModel):
    prompt: str
    context: Optional[dict] = None


class AdviceResponseSchema(BaseModel):
    advice: str
