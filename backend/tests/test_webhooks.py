import pytest
from unittest.mock import patch, MagicMock
from uuid import uuid4
from datetime import datetime
from fastapi import status


@pytest.mark.asyncio
async def test_stripe_webhook_payment_completed(client, db_session, test_firm, test_intake_form, test_client):
    """Test Stripe webhook for successful payment"""
    # Create a test submission
    from app.models.intake import IntakeSubmission

    submission = IntakeSubmission(
        id=uuid4(),
        form_id=test_intake_form.id,
        client_id=test_client.id,
        form_data={"test": "data"},
        payment_amount="1000.00",
        stripe_payment_intent_id="cs_test_123",
        payment_status="pending"
    )

    db_session.add(submission)
    await db_session.commit()

    # Mock webhook event
    event_data = {
        'type': 'checkout.session.completed',
        'data': {
            'id': 'cs_test_123',
            'metadata': {
                'submission_id': str(submission.id),
                'form_id': str(test_intake_form.id),
                'client_id': str(test_client.id)
            }
        }
    }

    # Mock the stripe webhook handler
    with patch('app.services.stripe_service.handle_webhook') as mock_webhook:
        mock_webhook.return_value = event_data

        response = await client.post(
            "/api/v1/webhooks/stripe",
            content=b'{"test": "payload"}',
            headers={'stripe-signature': 'test_signature'}
        )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['status'] == 'success'
    assert data['message'] == 'Payment completed'

    # Verify submission was updated
    await db_session.refresh(submission)
    assert submission.payment_status == 'succeeded'
    assert submission.status == 'payment_completed'
    assert submission.paid_at is not None


@pytest.mark.asyncio
async def test_stripe_webhook_missing_signature(client):
    """Test webhook fails without signature header"""

    response = await client.post(
        "/api/v1/webhooks/stripe",
        content=b'{"test": "payload"}'
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_stripe_webhook_expired_session(client, db_session, test_firm, test_intake_form, test_client):
    """Test Stripe webhook for expired payment session"""
    from app.models.intake import IntakeSubmission

    submission = IntakeSubmission(
        id=uuid4(),
        form_id=test_intake_form.id,
        client_id=test_client.id,
        form_data={"test": "data"},
        payment_amount="1000.00",
        stripe_payment_intent_id="cs_test_expired",
        payment_status="pending"
    )

    db_session.add(submission)
    await db_session.commit()

    event_data = {
        'type': 'checkout.session.expired',
        'data': {
            'id': 'cs_test_expired',
            'metadata': {
                'submission_id': str(submission.id)
            }
        }
    }

    with patch('app.services.stripe_service.handle_webhook') as mock_webhook:
        mock_webhook.return_value = event_data

        response = await client.post(
            "/api/v1/webhooks/stripe",
            content=b'{"test": "payload"}',
            headers={'stripe-signature': 'test_signature'}
        )

    assert response.status_code == status.HTTP_200_OK

    # Verify submission status updated
    await db_session.refresh(submission)
    assert submission.payment_status == 'expired'
    assert submission.status == 'payment_expired'


@pytest.mark.asyncio
async def test_payment_field_naming(client, db_session, test_firm, test_intake_form):
    """Test that payment intent ID is stored correctly in the database"""
    from app.models.intake import IntakeSubmission

    # Verify the field exists in the model
    submission = IntakeSubmission(
        form_id=test_intake_form.id,
        client_id=uuid4(),
        form_data={"email": "test@example.com"},
        payment_amount="500.00"
    )

    # This should work without AttributeError
    submission.stripe_payment_intent_id = "pi_test_123"

    db_session.add(submission)
    await db_session.commit()
    await db_session.refresh(submission)

    assert submission.stripe_payment_intent_id == "pi_test_123"
