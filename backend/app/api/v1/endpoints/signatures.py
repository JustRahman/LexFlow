from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
from typing import Dict, Any

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.intake import IntakeSubmission, IntakeForm
from app.models.document import Document
from app.services.docusign_service import docusign_service
from app.services.s3_service import download_file

router = APIRouter()


@router.post("/public/sign/{submission_id}")
async def sign_document_public(
    submission_id: UUID,
    signature_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Public endpoint for clients to sign retainer agreement

    This is a simple signature capture for MVP.
    In production, this would integrate with DocuSign.
    """
    # Get submission
    result = await db.execute(
        select(IntakeSubmission).where(IntakeSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Store signature information in form_data
    # Create a new dict to ensure SQLAlchemy detects the change
    current_data = submission.form_data or {}
    updated_data = {**current_data}
    updated_data['signature_name'] = signature_data.get('signature_name')
    updated_data['signature_date'] = signature_data.get('signature_date')

    # Assign the new dict
    submission.form_data = updated_data

    # Mark as signed
    submission.signature_status = 'signed'
    submission.signed_at = datetime.utcnow()

    # Update overall status
    if submission.payment_status == 'succeeded' or not submission.payment_amount:
        submission.status = 'completed'
    else:
        submission.status = 'awaiting_payment'

    await db.commit()

    return {
        'status': 'success',
        'message': 'Document signed successfully',
        'submission_id': str(submission_id),
        'next_step': 'payment' if submission.payment_amount and submission.payment_status == 'pending' else 'complete'
    }


@router.post("/public/pay/{submission_id}")
async def complete_payment_public(
    submission_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Public endpoint to mark payment as completed (for testing/placeholder)

    In production, this would be handled by Stripe webhooks.
    """
    # Get submission
    result = await db.execute(
        select(IntakeSubmission).where(IntakeSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Mark payment as succeeded
    submission.payment_status = 'succeeded'
    submission.paid_at = datetime.utcnow()
    submission.status = 'completed'

    await db.commit()

    return {
        'status': 'success',
        'message': 'Payment completed successfully',
        'submission_id': str(submission_id),
        'payment_status': 'succeeded'
    }


@router.post("/submissions/{submission_id}/request")
async def request_signature(
    submission_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Send a signature request for a submission

    Requires:
    - Submission must have a retainer document uploaded
    - User must belong to the firm that owns the submission
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

    # Check if already signed
    if submission.signature_status == 'signed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document already signed"
        )

    # Get client info
    from app.models.client import Client
    client_result = await db.execute(
        select(Client).where(Client.id == submission.client_id)
    )
    client = client_result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Get retainer document
    doc_result = await db.execute(
        select(Document).where(
            Document.submission_id == submission_id,
            Document.document_type.in_(['retainer', 'retainer_template'])
        )
    )
    document = doc_result.first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No retainer document found. Please upload a retainer first."
        )

    try:
        # Download document from S3
        document_obj = document[0]  # Extract from tuple
        doc_content = await download_file(document_obj.s3_key)

        # Get form for return URL
        form_result = await db.execute(
            select(IntakeForm).where(IntakeForm.id == submission.form_id)
        )
        form = form_result.scalar_one()

        # Send signature request via DocuSign
        from app.core.config import settings
        result = await docusign_service.create_envelope(
            signer_email=client.email,
            signer_name=f"{client.first_name} {client.last_name}",
            document_content=doc_content,
            document_name=f"{form.name} - Retainer Agreement",
            return_url=f"{settings.CORS_ORIGINS[0]}/signature/complete?submission_id={submission_id}",
            metadata={
                'submission_id': str(submission_id),
                'client_id': str(client.id),
                'form_id': str(form.id)
            }
        )

        if result['status'] == 'success':
            # Update submission
            submission.docusign_envelope_id = result['envelope_id']
            submission.signature_status = 'sent'
            submission.status = 'awaiting_signature'

            await db.commit()

            return {
                'status': 'success',
                'message': 'Signature request sent',
                'envelope_id': result['envelope_id'],
                'signing_url': result.get('signing_url')
            }
        else:
            return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send signature request: {str(e)}"
        )


@router.get("/submissions/{submission_id}/status")
async def get_signature_status(
    submission_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get the signature status for a submission"""

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

    # If no envelope ID, signature hasn't been requested
    if not submission.docusign_envelope_id:
        return {
            'status': 'not_requested',
            'signature_status': submission.signature_status,
            'message': 'Signature has not been requested yet'
        }

    # Check status with DocuSign
    try:
        docusign_result = await docusign_service.get_envelope_status(
            submission.docusign_envelope_id
        )

        if docusign_result['status'] == 'success':
            # Update local status if changed
            envelope_status = docusign_result['envelope_status'].lower()

            if envelope_status == 'completed' and submission.signature_status != 'signed':
                submission.signature_status = 'signed'
                submission.signed_at = datetime.utcnow()
                submission.status = 'completed'
                await db.commit()

            elif envelope_status == 'declined' and submission.signature_status != 'declined':
                submission.signature_status = 'declined'
                submission.status = 'declined'
                await db.commit()

            return {
                'status': 'success',
                'submission_id': str(submission_id),
                'signature_status': submission.signature_status,
                'envelope_id': submission.docusign_envelope_id,
                'envelope_status': envelope_status,
                'sent_date': docusign_result.get('sent_date'),
                'completed_date': docusign_result.get('completed_date'),
                'declined_date': docusign_result.get('declined_date')
            }
        else:
            return docusign_result

    except Exception as e:
        return {
            'status': 'error',
            'signature_status': submission.signature_status,
            'message': f'Failed to check status: {str(e)}'
        }


@router.post("/webhooks/docusign")
async def docusign_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Handle DocuSign webhook events

    DocuSign sends webhooks for envelope events:
    - envelope-sent
    - envelope-delivered
    - envelope-completed
    - envelope-declined
    - envelope-voided
    """
    try:
        # Get webhook payload
        payload = await request.json()

        # Extract event data
        event = payload.get('event')
        envelope_id = payload.get('data', {}).get('envelopeSummary', {}).get('envelopeId')

        if not envelope_id:
            return {
                'status': 'error',
                'message': 'No envelope ID in payload'
            }

        # Find submission by envelope ID
        result = await db.execute(
            select(IntakeSubmission).where(
                IntakeSubmission.docusign_envelope_id == envelope_id
            )
        )
        submission = result.scalar_one_or_none()

        if not submission:
            print(f"Warning: Submission not found for envelope {envelope_id}")
            return {
                'status': 'warning',
                'message': 'Submission not found'
            }

        # Update submission based on event
        if event == 'envelope-completed':
            submission.signature_status = 'signed'
            submission.signed_at = datetime.utcnow()
            submission.status = 'completed'

            # TODO: Download signed document and store in S3
            # signed_doc = await docusign_service.download_signed_document(envelope_id)
            # await upload_signed_document_to_s3(signed_doc, submission.id)

        elif event == 'envelope-declined':
            submission.signature_status = 'declined'
            submission.status = 'declined'

        elif event == 'envelope-voided':
            submission.signature_status = 'voided'
            submission.status = 'cancelled'

        elif event == 'envelope-delivered':
            # Envelope was delivered to signer
            if submission.signature_status == 'sent':
                submission.signature_status = 'delivered'

        await db.commit()

        return {
            'status': 'success',
            'event': event,
            'envelope_id': envelope_id,
            'submission_id': str(submission.id)
        }

    except Exception as e:
        print(f"DocuSign webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
