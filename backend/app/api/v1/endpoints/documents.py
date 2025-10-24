from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from io import BytesIO

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.document import Document
from app.models.intake import IntakeSubmission, IntakeForm
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.s3_service import upload_file, download_file, generate_presigned_url

router = APIRouter()


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    submission_id: UUID,
    document_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a document and associate it with a submission

    Requires authentication. User must belong to the firm that owns the submission.
    """
    # Verify submission exists and belongs to user's firm
    result = await db.execute(
        select(IntakeSubmission)
        .join(IntakeForm)
        .where(
            IntakeSubmission.id == submission_id,
            IntakeForm.firm_id == current_user.firm_id
        )
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Validate file size (max 10MB)
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10MB limit"
        )

    # Upload to S3
    try:
        file_obj = BytesIO(file_content)
        upload_result = await upload_file(
            file_obj=file_obj,
            filename=file.filename,
            content_type=file.content_type,
            folder=f"submissions/{submission_id}"
        )

        # Create document record
        document = Document(
            submission_id=submission_id,
            filename=file.filename,
            document_type=document_type,
            mime_type=file.content_type,
            file_size=file_size,
            s3_key=upload_result['s3_key'],
            s3_bucket=upload_result['bucket']
        )

        db.add(document)
        await db.commit()
        await db.refresh(document)

        # Generate presigned URL for immediate download
        download_url = await generate_presigned_url(document.s3_key)

        # Add download URL to response
        response = DocumentResponse.model_validate(document)
        response.download_url = download_url

        return DocumentUploadResponse(document=response)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get document metadata and download URL"""

    # Verify document exists and belongs to user's firm
    result = await db.execute(
        select(Document)
        .join(IntakeSubmission)
        .join(IntakeForm)
        .where(
            Document.id == document_id,
            IntakeForm.firm_id == current_user.firm_id
        )
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Generate presigned URL
    download_url = await generate_presigned_url(document.s3_key)

    response = DocumentResponse.model_validate(document)
    response.download_url = download_url

    return response


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Download document file directly"""

    # Verify document exists and belongs to user's firm
    result = await db.execute(
        select(Document)
        .join(IntakeSubmission)
        .join(IntakeForm)
        .where(
            Document.id == document_id,
            IntakeForm.firm_id == current_user.firm_id
        )
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    try:
        # Download from S3
        file_content = await download_file(document.s3_key)

        # Return as streaming response
        return StreamingResponse(
            BytesIO(file_content),
            media_type=document.mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{document.filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}"
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a document"""

    # Verify document exists and user is superuser or belongs to firm
    result = await db.execute(
        select(Document)
        .join(IntakeSubmission)
        .join(IntakeForm)
        .where(
            Document.id == document_id,
            IntakeForm.firm_id == current_user.firm_id
        )
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can delete documents"
        )

    try:
        # Delete from S3
        from app.services.s3_service import delete_file
        await delete_file(document.s3_key)

        # Delete from database
        await db.delete(document)
        await db.commit()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}"
        )


@router.get("/submission/{submission_id}/list", response_model=list[DocumentResponse])
async def list_submission_documents(
    submission_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all documents for a submission"""

    # Verify submission belongs to user's firm
    result = await db.execute(
        select(IntakeSubmission)
        .join(IntakeForm)
        .where(
            IntakeSubmission.id == submission_id,
            IntakeForm.firm_id == current_user.firm_id
        )
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Get all documents
    result = await db.execute(
        select(Document).where(Document.submission_id == submission_id)
    )
    documents = result.scalars().all()

    # Add download URLs
    response_documents = []
    for doc in documents:
        download_url = await generate_presigned_url(doc.s3_key)
        doc_response = DocumentResponse.model_validate(doc)
        doc_response.download_url = download_url
        response_documents.append(doc_response)

    return response_documents
