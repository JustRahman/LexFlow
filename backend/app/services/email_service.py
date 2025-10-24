import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.core.config import settings


async def send_email(
    to_email: str | List[str],
    subject: str,
    body: str,
    html_body: Optional[str] = None,
    from_email: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP

    Args:
        to_email: Recipient email(s)
        subject: Email subject
        body: Plain text email body
        html_body: Optional HTML email body
        from_email: Sender email (defaults to SMTP_FROM_EMAIL)

    Returns:
        True if email sent successfully
    """
    # Skip if SMTP is not configured
    if not settings.SMTP_HOST:
        print(f"SMTP not configured. Email would be sent to {to_email}: {subject}")
        return False

    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email or settings.SMTP_FROM_EMAIL
        msg['To'] = ', '.join(to_email) if isinstance(to_email, list) else to_email

        # Add plain text body
        text_part = MIMEText(body, 'plain')
        msg.attach(text_part)

        # Add HTML body if provided
        if html_body:
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)

        # Connect to SMTP server and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

            recipients = to_email if isinstance(to_email, list) else [to_email]
            server.sendmail(msg['From'], recipients, msg.as_string())

        return True

    except Exception as e:
        print(f"Email send error: {str(e)}")
        return False


async def send_submission_confirmation(
    client_email: str,
    client_name: str,
    firm_name: str,
    form_name: str,
    submission_id: str
) -> bool:
    """Send confirmation email to client after form submission"""

    subject = f"Thank you for your submission - {firm_name}"

    body = f"""
Dear {client_name},

Thank you for submitting your intake form to {firm_name}.

Form: {form_name}
Submission ID: {submission_id}

We have received your information and will review it shortly. A member of our team will contact you within 1-2 business days.

If you have any questions, please don't hesitate to reach out.

Best regards,
{firm_name}

---
This is an automated message from LexFlow
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
        .info-box {{ background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #2563eb; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Submission Received</h1>
        </div>
        <div class="content">
            <p>Dear {client_name},</p>

            <p>Thank you for submitting your intake form to <strong>{firm_name}</strong>.</p>

            <div class="info-box">
                <p><strong>Form:</strong> {form_name}</p>
                <p><strong>Submission ID:</strong> {submission_id}</p>
            </div>

            <p>We have received your information and will review it shortly. A member of our team will contact you within 1-2 business days.</p>

            <p>If you have any questions, please don't hesitate to reach out.</p>

            <p>Best regards,<br><strong>{firm_name}</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message from LexFlow</p>
        </div>
    </div>
</body>
</html>
"""

    return await send_email(client_email, subject, body, html_body)


async def send_payment_confirmation(
    client_email: str,
    client_name: str,
    firm_name: str,
    amount: str,
    submission_id: str
) -> bool:
    """Send payment confirmation email to client"""

    subject = f"Payment Received - {firm_name}"

    body = f"""
Dear {client_name},

This email confirms that we have received your payment of ${amount}.

Submission ID: {submission_id}

Thank you for your payment. We will begin processing your case shortly.

Best regards,
{firm_name}

---
This is an automated message from LexFlow
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
        .amount {{ font-size: 24px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }}
        .info-box {{ background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Payment Received</h1>
        </div>
        <div class="content">
            <p>Dear {client_name},</p>

            <p>This email confirms that we have received your payment.</p>

            <div class="amount">${amount}</div>

            <div class="info-box">
                <p><strong>Submission ID:</strong> {submission_id}</p>
            </div>

            <p>Thank you for your payment. We will begin processing your case shortly.</p>

            <p>Best regards,<br><strong>{firm_name}</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message from LexFlow</p>
        </div>
    </div>
</body>
</html>
"""

    return await send_email(client_email, subject, body, html_body)


async def send_firm_notification(
    firm_email: str,
    firm_name: str,
    client_name: str,
    client_email: str,
    form_name: str,
    submission_id: str
) -> bool:
    """Notify firm about new submission"""

    subject = f"New Client Submission: {client_name}"

    body = f"""
New client submission received on LexFlow.

Client: {client_name} ({client_email})
Form: {form_name}
Submission ID: {submission_id}

Log in to your LexFlow dashboard to review this submission.

---
LexFlow - Legal Client Intake Platform
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
        .info-box {{ background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #6366f1; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 New Client Submission</h1>
        </div>
        <div class="content">
            <p>Hello {firm_name} team,</p>

            <p>You have received a new client submission on LexFlow.</p>

            <div class="info-box">
                <p><strong>Client:</strong> {client_name}</p>
                <p><strong>Email:</strong> {client_email}</p>
                <p><strong>Form:</strong> {form_name}</p>
                <p><strong>Submission ID:</strong> {submission_id}</p>
            </div>

            <p style="text-align: center;">
                <a href="#" class="button">View Submission</a>
            </p>

            <p>Log in to your LexFlow dashboard to review this submission and take action.</p>
        </div>
        <div class="footer">
            <p>LexFlow - Legal Client Intake Platform</p>
        </div>
    </div>
</body>
</html>
"""

    return await send_email(firm_email, subject, body, html_body)
