from fastapi import APIRouter
from app.api.v1.endpoints import auth, intake, clients, firms, users, webhooks, documents, signatures

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(firms.router, prefix="/firms", tags=["Firms"])
api_router.include_router(intake.router, prefix="/intake", tags=["Intake Forms"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(signatures.router, prefix="/signatures", tags=["E-Signatures"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])


@api_router.get("/")
async def api_root() -> dict[str, str]:
    """API v1 root endpoint"""
    return {"message": "LexFlow API v1"}
