from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.firm import Firm
from app.schemas.firm import FirmResponse, FirmUpdate

router = APIRouter()


@router.get("/me", response_model=FirmResponse)
async def get_my_firm(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Firm:
    """Get current user's firm"""

    result = await db.execute(
        select(Firm).where(Firm.id == current_user.firm_id)
    )
    firm = result.scalar_one_or_none()

    if not firm:
        raise HTTPException(status_code=404, detail="Firm not found")

    return firm


@router.put("/me", response_model=FirmResponse)
async def update_my_firm(
    firm_data: FirmUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Firm:
    """Update current user's firm"""

    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only firm administrators can update firm settings"
        )

    result = await db.execute(
        select(Firm).where(Firm.id == current_user.firm_id)
    )
    firm = result.scalar_one_or_none()

    if not firm:
        raise HTTPException(status_code=404, detail="Firm not found")

    # Update fields
    update_data = firm_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(firm, field, value)

    await db.commit()
    await db.refresh(firm)

    return firm
