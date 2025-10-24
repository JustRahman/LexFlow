from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.client import Client
from app.schemas.client import ClientResponse, ClientUpdate, ClientList

router = APIRouter()


@router.get("/", response_model=ClientList)
async def list_clients(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status_filter: str | None = None
) -> dict:
    """List all clients for current user's firm"""

    query = select(Client).where(Client.firm_id == current_user.firm_id)

    if status_filter:
        query = query.where(Client.status == status_filter)

    result = await db.execute(query.offset(skip).limit(limit))
    clients = result.scalars().all()

    # Get total count
    count_query = select(func.count(Client.id)).where(Client.firm_id == current_user.firm_id)
    if status_filter:
        count_query = count_query.where(Client.status == status_filter)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {"items": clients, "total": total}


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Client:
    """Get a specific client"""

    result = await db.execute(
        select(Client)
        .where(Client.id == client_id, Client.firm_id == current_user.firm_id)
    )
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    return client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: UUID,
    client_data: ClientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Client:
    """Update a client"""

    result = await db.execute(
        select(Client)
        .where(Client.id == client_id, Client.firm_id == current_user.firm_id)
    )
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Update fields
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)

    await db.commit()
    await db.refresh(client)

    return client
