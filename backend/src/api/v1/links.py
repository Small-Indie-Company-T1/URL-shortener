import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from src.db.queries import LinkQueriesQueries
from src.db.database import get_db
from src.schemas.links import LinkCreate, LinkRead
from src.services.links import LinkService


router = APIRouter()

@router.post("/create", response_model=LinkRead, status_code=status.HTTP_201_CREATED)
async def create_link(
    payload: LinkCreate,
    db: asyncpg.Connection = Depends(get_db)
):
    service = LinkService(LinkQueriesQueries(db))
    try:
        new_link = await service.create_short_link(
            original_url=str(payload.original_url),
            user_id=1 # FIXME
        )
        return new_link
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка"
        )
    