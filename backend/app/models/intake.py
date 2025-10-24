from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base import Base


class IntakeForm(Base):
    """Intake form template created by law firms"""

    __tablename__ = "intake_forms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firm_id = Column(UUID(as_uuid=True), ForeignKey("firms.id"), nullable=False)

    name = Column(String, nullable=False)
    description = Column(Text)

    # Form configuration (JSON schema for fields)
    fields_schema = Column(JSON, nullable=False)

    # Retainer agreement template
    retainer_template_url = Column(String)  # S3 URL

    # Payment settings
    retainer_amount = Column(String)  # Can be fixed or variable
    payment_required = Column(Boolean, default=True)

    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    firm = relationship("Firm", back_populates="intake_forms")
    submissions = relationship("IntakeSubmission", back_populates="form")


class IntakeSubmission(Base):
    """Client submission of an intake form"""

    __tablename__ = "intake_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_id = Column(UUID(as_uuid=True), ForeignKey("intake_forms.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)

    # Submitted form data
    form_data = Column(JSON, nullable=False)

    # E-signature tracking
    docusign_envelope_id = Column(String)
    signature_status = Column(String, default="pending")  # pending, sent, signed, declined
    signed_at = Column(DateTime(timezone=True))

    # Payment tracking
    stripe_payment_intent_id = Column(String)
    payment_status = Column(String, default="pending")  # pending, succeeded, failed
    payment_amount = Column(String)
    paid_at = Column(DateTime(timezone=True))

    # Overall status
    status = Column(String, default="submitted")  # submitted, processing, completed, rejected

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    form = relationship("IntakeForm", back_populates="submissions")
    client = relationship("Client", back_populates="submissions")
    documents = relationship("Document", back_populates="submission")
