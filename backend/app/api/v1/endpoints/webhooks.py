from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from uuid import UUID

from app.core.deps import get_db
from app.models.intake import IntakeSubmission
from app.services.stripe_service import handle_webhook

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhook events

    Supported events:
    - checkout.session.completed: Payment successful
    - checkout.session.expired: Payment session expired
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )

    try:
        # Verify and parse webhook event
        event = await handle_webhook(payload, sig_header)
        event_type = event['type']
        event_data = event['data']

        # Handle checkout.session.completed event
        if event_type == 'checkout.session.completed':
            session_id = event_data.get('id')
            metadata = event_data.get('metadata', {})
            submission_id = metadata.get('submission_id')

            if not submission_id:
                # Log warning but return success (webhook already received)
                print(f"Warning: No submission_id in metadata for session {session_id}")
                return {"status": "warning", "message": "No submission_id in metadata"}

            # Find and update the submission
            result = await db.execute(
                select(IntakeSubmission).where(
                    IntakeSubmission.id == UUID(submission_id)
                )
            )
            submission = result.scalar_one_or_none()

            if not submission:
                # Log error but return success (webhook already received)
                print(f"Error: Submission {submission_id} not found")
                return {"status": "error", "message": "Submission not found"}

            # Update payment status
            submission.payment_status = "succeeded"
            submission.paid_at = datetime.utcnow()
            submission.status = "payment_completed"

            await db.commit()

            return {
                "status": "success",
                "message": "Payment completed",
                "submission_id": str(submission_id)
            }

        # Handle checkout.session.expired event
        elif event_type == 'checkout.session.expired':
            metadata = event_data.get('metadata', {})
            submission_id = metadata.get('submission_id')

            if submission_id:
                result = await db.execute(
                    select(IntakeSubmission).where(
                        IntakeSubmission.id == UUID(submission_id)
                    )
                )
                submission = result.scalar_one_or_none()

                if submission:
                    submission.payment_status = "expired"
                    submission.status = "payment_expired"
                    await db.commit()

            return {
                "status": "success",
                "message": "Payment session expired",
                "submission_id": str(submission_id) if submission_id else None
            }

        # For other event types, just acknowledge receipt
        else:
            return {
                "status": "success",
                "message": f"Event {event_type} received but not processed"
            }

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
