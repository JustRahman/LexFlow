from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class DocumentBase(BaseModel):
    """Base document schema"""
    filename: str
    document_type: str  # attachment, retainer, signed_retainer, etc.
    mime_type: Optional[str] = None


class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    submission_id: UUID
    file_size: int
    s3_key: str
    s3_bucket: str


class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: UUID
    submission_id: UUID
    file_size: int
    s3_key: str
    s3_bucket: str
    created_at: datetime
    download_url: Optional[str] = None  # Presigned URL for download

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    """Response after successful upload"""
    document: DocumentResponse
    message: str = "Document uploaded successfully"
