from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Any


class ClientBase(BaseModel):
    """Base client schema"""
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None


class ClientCreate(ClientBase):
    """Client creation schema"""
    intake_data: dict[str, Any] | None = None


class ClientUpdate(BaseModel):
    """Client update schema"""
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    intake_data: dict[str, Any] | None = None
    status: str | None = None


class ClientResponse(ClientBase):
    """Client response schema"""
    id: UUID
    firm_id: UUID
    intake_data: dict[str, Any] | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClientList(BaseModel):
    """List of clients"""
    items: list[ClientResponse]
    total: int
