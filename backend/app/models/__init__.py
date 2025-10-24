# Import all models here for Alembic to detect them
from app.models.user import User
from app.models.firm import Firm
from app.models.client import Client
from app.models.intake import IntakeForm, IntakeSubmission
from app.models.document import Document

__all__ = ["User", "Firm", "Client", "IntakeForm", "IntakeSubmission", "Document"]
