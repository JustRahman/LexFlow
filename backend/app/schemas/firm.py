from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Any


class FirmBase(BaseModel):
    """Base firm schema"""
    name: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None


class FirmCreate(FirmBase):
    """Firm creation schema"""
    pass


class FirmUpdate(BaseModel):
    """Firm update schema"""
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    branding: dict[str, Any] | None = None


class FirmResponse(FirmBase):
    """Firm response schema"""
    id: UUID
    subscription_status: str
    is_active: bool
    branding: dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True
