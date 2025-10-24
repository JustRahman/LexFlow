from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base import Base


class Firm(Base):
    """Law firm/tenant model"""

    __tablename__ = "firms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)

    # Subscription & billing
    stripe_customer_id = Column(String, unique=True)
    subscription_status = Column(String, default="trial")  # trial, active, cancelled, past_due

    # Customization
    branding = Column(JSON)  # Logo URL, colors, etc.

    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="firm")
    clients = relationship("Client", back_populates="firm")
    intake_forms = relationship("IntakeForm", back_populates="firm")
