from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.core.deps import get_db, get_current_active_user
from app.core.config import settings
from app.models.user import User
from app.models.intake import IntakeForm, IntakeSubmission
from app.models.client import Client
from app.schemas.intake import (
    IntakeFormCreate,
    IntakeFormUpdate,
    IntakeFormResponse,
    IntakeSubmissionCreate,
    IntakeSubmissionPublicCreate,
    IntakeSubmissionResponse,
    IntakeSubmissionList
)
from app.services.stripe_service import create_checkout_session

router = APIRouter()


@router.post("/forms", response_model=IntakeFormResponse, status_code=status.HTTP_201_CREATED)
async def create_intake_form(
    form_data: IntakeFormCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> IntakeForm:
    """Create a new intake form"""

    form = IntakeForm(
        **form_data.model_dump(),
        firm_id=current_user.firm_id
    )

    db.add(form)
    await db.commit()
    await db.refresh(form)

    return form


@router.get("/forms", response_model=list[IntakeFormResponse])
async def list_intake_forms(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> list[IntakeForm]:
    """List all intake forms for current user's firm"""

    result = await db.execute(
        select(IntakeForm)
        .where(IntakeForm.firm_id == current_user.firm_id)
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()


@router.get("/forms/{form_id}", response_model=IntakeFormResponse)
async def get_intake_form(
    form_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> IntakeForm:
    """Get a specific intake form"""

    result = await db.execute(
        select(IntakeForm)
        .where(IntakeForm.id == form_id, IntakeForm.firm_id == current_user.firm_id)
    )
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found")

    return form


@router.put("/forms/{form_id}", response_model=IntakeFormResponse)
async def update_intake_form(
    form_id: UUID,
    form_data: IntakeFormUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> IntakeForm:
    """Update an intake form"""

    result = await db.execute(
        select(IntakeForm)
        .where(IntakeForm.id == form_id, IntakeForm.firm_id == current_user.firm_id)
    )
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found")

    # Update fields
    update_data = form_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(form, field, value)

    await db.commit()
    await db.refresh(form)

    return form


@router.delete("/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_intake_form(
    form_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    """Delete an intake form"""

    result = await db.execute(
        select(IntakeForm)
        .where(IntakeForm.id == form_id, IntakeForm.firm_id == current_user.firm_id)
    )
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found")

    await db.delete(form)
    await db.commit()


@router.get("/submissions", response_model=IntakeSubmissionList)
async def list_submissions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> dict:
    """List all submissions for current user's firm"""

    # Get submissions where form belongs to user's firm
    result = await db.execute(
        select(IntakeSubmission)
        .join(IntakeForm)
        .where(IntakeForm.firm_id == current_user.firm_id)
        .offset(skip)
        .limit(limit)
    )
    submissions = result.scalars().all()

    # Get total count
    count_result = await db.execute(
        select(func.count(IntakeSubmission.id))
        .join(IntakeForm)
        .where(IntakeForm.firm_id == current_user.firm_id)
    )
    total = count_result.scalar()

    return {"items": submissions, "total": total}


@router.get("/submissions/{submission_id}", response_model=IntakeSubmissionResponse)
async def get_submission(
    submission_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> IntakeSubmission:
    """Get a specific submission"""

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
        raise HTTPException(status_code=404, detail="Submission not found")

    return submission


# Public endpoint to get form details (no auth required)
@router.get("/public/forms/{form_id}", response_model=IntakeFormResponse)
async def get_public_intake_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> IntakeForm:
    """Get a specific intake form for public form submission"""

    result = await db.execute(
        select(IntakeForm).where(IntakeForm.id == form_id)
    )
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found")

    # Only return active forms to public
    if not form.is_active:
        raise HTTPException(status_code=404, detail="This form is no longer active")

    return form


# Public endpoint for clients to submit intake forms
@router.post("/public/forms/{form_id}/submit", response_model=IntakeSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_intake_form(
    form_id: UUID,
    submission_data: IntakeSubmissionPublicCreate,
    db: AsyncSession = Depends(get_db)
) -> IntakeSubmission:
    """Public endpoint for clients to submit intake forms"""

    # Verify form exists and is active
    result = await db.execute(
        select(IntakeForm).where(IntakeForm.id == form_id, IntakeForm.is_active == True)
    )
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found or inactive")

    # Extract client info from form data
    form_data = submission_data.form_data
    client_email = form_data.get("email")
    client_first_name = form_data.get("first_name", form_data.get("firstName", ""))
    client_last_name = form_data.get("last_name", form_data.get("lastName", ""))

    if not client_email:
        raise HTTPException(status_code=400, detail="Client email is required")

    # Check if client exists, create if not
    client_result = await db.execute(
        select(Client).where(Client.email == client_email, Client.firm_id == form.firm_id)
    )
    client = client_result.scalar_one_or_none()

    if not client:
        client = Client(
            email=client_email,
            first_name=client_first_name,
            last_name=client_last_name,
            phone=form_data.get("phone"),
            firm_id=form.firm_id,
            intake_data=form_data
        )
        db.add(client)
        await db.flush()

    # Create submission
    submission = IntakeSubmission(
        form_id=form_id,
        client_id=client.id,
        form_data=form_data,
        payment_amount=form.retainer_amount
    )

    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # Determine the workflow: signature first, then payment
    signature_url = None
    payment_url = None
    next_step = None

    # Step 1: Check if signature is required (if there's a retainer template)
    if form.retainer_template_url or form.payment_required:
        # For now, we'll create a simple signature page
        # In production, this would integrate with DocuSign
        signature_url = f"{settings.CORS_ORIGINS[0]}/signature/sign?submission_id={submission.id}"
        submission.signature_status = 'pending'
        next_step = 'signature'

        # Also prepare payment URL for after signature
        if form.payment_required and form.retainer_amount:
            try:
                checkout_session = await create_checkout_session(
                    amount=float(form.retainer_amount),
                    success_url=f"{settings.CORS_ORIGINS[0]}/payment/success?submission_id={submission.id}",
                    cancel_url=f"{settings.CORS_ORIGINS[0]}/payment/cancelled?submission_id={submission.id}",
                    metadata={
                        'submission_id': str(submission.id),
                        'form_id': str(form_id),
                        'client_id': str(client.id),
                    }
                )
                payment_url = checkout_session['url']

                # Update submission with payment session ID
                submission.stripe_payment_intent_id = checkout_session['id']
            except Exception as e:
                # Log error but don't fail the submission
                print(f"Error creating payment session: {e}")

    elif form.payment_required and form.retainer_amount:
        # Payment only (no signature)
        try:
            checkout_session = await create_checkout_session(
                amount=float(form.retainer_amount),
                success_url=f"{settings.CORS_ORIGINS[0]}/payment/success?submission_id={submission.id}",
                cancel_url=f"{settings.CORS_ORIGINS[0]}/payment/cancelled?submission_id={submission.id}",
                metadata={
                    'submission_id': str(submission.id),
                    'form_id': str(form_id),
                    'client_id': str(client.id),
                }
            )
            payment_url = checkout_session['url']
            submission.stripe_payment_intent_id = checkout_session['id']
            next_step = 'payment'
        except Exception as e:
            print(f"Error creating payment session: {e}")

    await db.commit()

    # Build response with workflow information
    response = IntakeSubmissionResponse.model_validate(submission)
    if signature_url:
        response.signature_url = signature_url
    if payment_url:
        response.payment_url = payment_url
    if next_step:
        response.next_step = next_step

    return response


# Public endpoint to check submission status (no auth required)
@router.get("/public/submissions/{submission_id}", response_model=IntakeSubmissionResponse)
async def get_public_submission(
    submission_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> IntakeSubmission:
    """Get submission status (public endpoint for payment success verification)"""

    result = await db.execute(
        select(IntakeSubmission).where(IntakeSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    return submission
