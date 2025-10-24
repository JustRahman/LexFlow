import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    amount: float,
    currency: str = "usd",
    success_url: str = None,
    cancel_url: str = None,
    metadata: dict = None
) -> dict:
    """
    Create a Stripe checkout session for payment

    Args:
        amount: Amount in dollars (will be converted to cents)
        currency: Currency code (default: usd)
        success_url: URL to redirect after successful payment
        cancel_url: URL to redirect if payment is cancelled
        metadata: Additional metadata to attach to the payment

    Returns:
        dict with checkout session details including 'url' and 'id'
    """
    try:
        # Convert amount to cents
        amount_cents = int(float(amount) * 100)

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': currency,
                    'unit_amount': amount_cents,
                    'product_data': {
                        'name': 'Legal Retainer Fee',
                        'description': 'Retainer fee for legal services',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url or settings.CORS_ORIGINS[0] + '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=cancel_url or settings.CORS_ORIGINS[0] + '/payment/cancelled',
            metadata=metadata or {},
        )

        return {
            'id': session.id,
            'url': session.url,
            'status': session.status,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


async def verify_payment(session_id: str) -> dict:
    """
    Verify a payment session and get its status

    Args:
        session_id: Stripe checkout session ID

    Returns:
        dict with payment details including status and metadata
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        return {
            'id': session.id,
            'status': session.payment_status,
            'amount_total': session.amount_total / 100,  # Convert cents to dollars
            'currency': session.currency,
            'metadata': session.metadata,
            'customer_email': session.customer_details.email if session.customer_details else None,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


async def handle_webhook(payload: bytes, sig_header: str) -> dict:
    """
    Handle Stripe webhook events

    Args:
        payload: Raw request body
        sig_header: Stripe signature header

    Returns:
        dict with event data
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )

        return {
            'type': event['type'],
            'data': event['data']['object'],
        }
    except ValueError as e:
        raise Exception("Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise Exception("Invalid signature")
