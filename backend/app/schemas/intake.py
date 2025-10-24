from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any


class IntakeFormBase(BaseModel):
    """Base intake form schema"""
    name: str
    description: str | None = None
    fields_schema: dict[str, Any]
    retainer_amount: str | None = None
    payment_required: bool = True


class IntakeFormCreate(IntakeFormBase):
    """Intake form creation schema"""
    pass


class IntakeFormUpdate(BaseModel):
    """Intake form update schema"""
    name: str | None = None
    description: str | None = None
    fields_schema: dict[str, Any] | None = None
    retainer_amount: str | None = None
    payment_required: bool | None = None
    is_active: bool | None = None


class IntakeFormResponse(IntakeFormBase):
    """Intake form response schema"""
    id: UUID
    firm_id: UUID
    retainer_template_url: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class IntakeSubmissionBase(BaseModel):
    """Base intake submission schema"""
    form_data: dict[str, Any]


class IntakeSubmissionCreate(IntakeSubmissionBase):
    """Intake submission creation schema"""
    form_id: UUID


class IntakeSubmissionPublicCreate(IntakeSubmissionBase):
    """Public intake submission creation schema (form_id comes from URL)"""
    pass


class IntakeSubmissionResponse(IntakeSubmissionBase):
    """Intake submission response schema"""
    id: UUID
    form_id: UUID
    client_id: UUID
    signature_status: str
    payment_status: str
    payment_amount: str | None
    status: str
    signed_at: datetime | None
    paid_at: datetime | None
    created_at: datetime
    # Workflow URLs
    signature_url: str | None = None
    payment_url: str | None = None
    next_step: str | None = None  # 'signature', 'payment', or 'complete'

    class Config:
        from_attributes = True


class IntakeSubmissionList(BaseModel):
    """List of intake submissions"""
    items: list[IntakeSubmissionResponse]
    total: int
