from typing import Dict, Any, Optional, TYPE_CHECKING
from app.core.config import settings
import base64

try:
    from docusign_esign import ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Tabs, Recipients
    from docusign_esign.client.api_exception import ApiException
    DOCUSIGN_AVAILABLE = True
except ImportError:
    DOCUSIGN_AVAILABLE = False
    ApiException = Exception  # Fallback
    if TYPE_CHECKING:
        from docusign_esign import ApiClient  # For type checking only


class DocuSignService:
    """DocuSign e-signature integration service"""

    def __init__(self):
        self.integration_key = settings.DOCUSIGN_INTEGRATION_KEY
        self.user_id = settings.DOCUSIGN_USER_ID
        self.account_id = settings.DOCUSIGN_ACCOUNT_ID
        self.private_key_path = settings.DOCUSIGN_PRIVATE_KEY_PATH
        self.base_path = "https://demo.docusign.net/restapi"  # Change to "https://www.docusign.net/restapi" for production

        # Check if DocuSign is available and configured
        self.is_available = DOCUSIGN_AVAILABLE
        self.is_configured = DOCUSIGN_AVAILABLE and all([
            self.integration_key,
            self.user_id,
            self.account_id,
            self.private_key_path
        ])

    def _get_api_client(self) -> Any:
        """Get authenticated DocuSign API client"""
        if not self.is_configured:
            raise Exception("DocuSign is not configured. Please set DOCUSIGN_* environment variables.")

        api_client = ApiClient()
        api_client.set_base_path(self.base_path)

        # JWT authentication
        try:
            with open(self.private_key_path, 'r') as key_file:
                private_key = key_file.read()

            # Get JWT token
            response = api_client.request_jwt_user_token(
                client_id=self.integration_key,
                user_id=self.user_id,
                oauth_host_name="account-d.docusign.com",  # Use "account.docusign.com" for production
                private_key_bytes=private_key,
                expires_in=3600,
                scopes=["signature", "impersonation"]
            )

            # Set access token
            api_client.set_default_header("Authorization", f"Bearer {response.access_token}")

        except Exception as e:
            raise Exception(f"DocuSign authentication failed: {str(e)}")

        return api_client

    async def create_envelope(
        self,
        signer_email: str,
        signer_name: str,
        document_path: Optional[str] = None,
        document_content: Optional[bytes] = None,
        document_name: str = "Retainer Agreement",
        return_url: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a DocuSign envelope and send for signature

        Args:
            signer_email: Email of the person who needs to sign
            signer_name: Full name of signer
            document_path: Path to document file (alternative to document_content)
            document_content: Document content as bytes (alternative to document_path)
            document_name: Name of the document
            return_url: URL to redirect after signing
            metadata: Additional metadata to attach to envelope

        Returns:
            Dictionary with envelope_id, status, and signing_url
        """
        if not self.is_available:
            return {
                'status': 'error',
                'message': 'DocuSign library not installed. Run: pip install docusign-esign'
            }

        if not self.is_configured:
            return {
                'status': 'error',
                'message': 'DocuSign not configured. Set DOCUSIGN_* environment variables.'
            }

        try:
            api_client = self._get_api_client()
            envelopes_api = EnvelopesApi(api_client)

            # Load document
            if document_content:
                doc_b64 = base64.b64encode(document_content).decode('ascii')
            elif document_path:
                with open(document_path, 'rb') as file:
                    doc_b64 = base64.b64encode(file.read()).decode('ascii')
            else:
                raise ValueError("Either document_path or document_content must be provided")

            # Create document
            document = Document(
                document_base64=doc_b64,
                name=document_name,
                file_extension='pdf',
                document_id='1'
            )

            # Create signer
            signer = Signer(
                email=signer_email,
                name=signer_name,
                recipient_id='1',
                routing_order='1',
                client_user_id=None  # Set to None for remote signing
            )

            # Add signature tab
            sign_here = SignHere(
                document_id='1',
                page_number='1',
                x_position='100',
                y_position='700'
            )
            signer.tabs = Tabs(sign_here_tabs=[sign_here])

            # Create recipients
            recipients = Recipients(signers=[signer])

            # Create envelope definition
            envelope_definition = EnvelopeDefinition(
                email_subject=f"Please sign: {document_name}",
                documents=[document],
                recipients=recipients,
                status="sent"  # Send immediately
            )

            # Add custom fields for metadata
            if metadata:
                from docusign_esign import CustomFields, TextCustomField
                custom_fields = CustomFields(
                    text_custom_fields=[
                        TextCustomField(name=k, value=v)
                        for k, v in metadata.items()
                    ]
                )
                envelope_definition.custom_fields = custom_fields

            # Create envelope
            results = envelopes_api.create_envelope(
                account_id=self.account_id,
                envelope_definition=envelope_definition
            )

            # Get signing URL
            from docusign_esign import RecipientViewRequest
            recipient_view = RecipientViewRequest(
                authentication_method='none',
                client_user_id=None,
                recipient_id='1',
                return_url=return_url or "https://www.docusign.com/devcenter",
                user_name=signer_name,
                email=signer_email
            )

            # For embedded signing, we would get a signing URL
            # For remote signing, DocuSign sends email directly
            # signing_url = envelopes_api.create_recipient_view(
            #     account_id=self.account_id,
            #     envelope_id=results.envelope_id,
            #     recipient_view_request=recipient_view
            # ).url

            return {
                'status': 'success',
                'envelope_id': results.envelope_id,
                'envelope_status': results.status,
                'signing_url': None,  # DocuSign will email the signer
                'message': 'Signature request sent via email'
            }

        except ApiException as e:
            return {
                'status': 'error',
                'message': f'DocuSign API error: {e.reason}'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'DocuSign error: {str(e)}'
            }

    async def get_envelope_status(self, envelope_id: str) -> Dict[str, Any]:
        """
        Get the status of a DocuSign envelope

        Args:
            envelope_id: DocuSign envelope ID

        Returns:
            Dictionary with envelope status details
        """
        if not self.is_available:
            return {
                'status': 'error',
                'message': 'DocuSign library not installed. Run: pip install docusign-esign'
            }

        if not self.is_configured:
            return {
                'status': 'error',
                'message': 'DocuSign not configured. Set DOCUSIGN_* environment variables.'
            }

        try:
            api_client = self._get_api_client()
            envelopes_api = EnvelopesApi(api_client)

            envelope = envelopes_api.get_envelope(
                account_id=self.account_id,
                envelope_id=envelope_id
            )

            return {
                'status': 'success',
                'envelope_id': envelope_id,
                'envelope_status': envelope.status,
                'sent_date': envelope.sent_date_time,
                'completed_date': envelope.completed_date_time,
                'declined_date': envelope.declined_date_time
            }

        except ApiException as e:
            return {
                'status': 'error',
                'message': f'DocuSign API error: {e.reason}'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'DocuSign error: {str(e)}'
            }

    async def download_signed_document(self, envelope_id: str, document_id: str = '1') -> bytes:
        """
        Download a signed document from DocuSign

        Args:
            envelope_id: DocuSign envelope ID
            document_id: Document ID (default: '1')

        Returns:
            Document content as bytes
        """
        if not self.is_configured:
            raise Exception("DocuSign not configured")

        try:
            api_client = self._get_api_client()
            envelopes_api = EnvelopesApi(api_client)

            # Get document
            document = envelopes_api.get_document(
                account_id=self.account_id,
                envelope_id=envelope_id,
                document_id=document_id
            )

            return document

        except ApiException as e:
            raise Exception(f'DocuSign API error: {e.reason}')
        except Exception as e:
            raise Exception(f'DocuSign error: {str(e)}')


# Global instance
docusign_service = DocuSignService()
