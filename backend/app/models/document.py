from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base import Base


class Document(Base):
    """Stored documents (signed retainers, attachments, etc.)"""

    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("intake_submissions.id"), nullable=False)

    # Document metadata
    filename = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # retainer, attachment, id_proof, etc.
    mime_type = Column(String)
    file_size = Column(Integer)

    # Storage location
    s3_key = Column(String, nullable=False)
    s3_bucket = Column(String, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("IntakeSubmission", back_populates="documents")
