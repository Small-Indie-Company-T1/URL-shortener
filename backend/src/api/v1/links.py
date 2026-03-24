from fastapi import APIRouter, Depends, HTTPException, status

from src.api.deps import get_link_service
from src.schemas.links import LinkCreate, LinkRead
from src.services.links import LinkService


router = APIRouter(
    prefix='/links',
    tags=['Links']
)

@router.post("/", response_model=LinkRead, status_code=status.HTTP_201_CREATED)
async def create_link(
    payload: LinkCreate,
    service: LinkService = Depends(get_link_service)
):
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
    