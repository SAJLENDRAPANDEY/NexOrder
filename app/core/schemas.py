from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import List, Optional


# =========================
# USER SCHEMAS
# =========================

class UserBase(BaseModel):
    email: EmailStr
    username: str


class ChangePassword(BaseModel):
    """Password change ke liye schema"""
    current_password: str
    new_password: str
    confirm_password: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    balance: float
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# =========================
# PRODUCT SCHEMAS
# =========================

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None
    is_available: Optional[bool] = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# =========================
# ORDER SCHEMAS
# =========================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    scheduled_date: str
    time_slot: str


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    scheduled_date: Optional[str] = None   
    time_slot: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_status: Optional[str] = None
    used_wallet: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =========================
# WALLET SCHEMAS
# =========================

class WalletTopUpRequest(BaseModel):
    amount: float

class WalletTransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str
    razorpay_order_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    scheduled_date: Optional[str] = None
    time_slot: Optional[str] = None

