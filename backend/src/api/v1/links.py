from typing import Literal

import asyncpg
import redis.asyncio as redis
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Query

from src.db.queries import LinkQueriesQueries
from src.db.database import get_db
from src.schemas.links import LinkCreate, LinkRead, LinkList
from src.services.links import LinkService
from src.api.deps import get_current_user
from src.db.redis import get_bin_redis


router = APIRouter()

@router.post("/create", response_model=LinkRead, status_code=status.HTTP_201_CREATED)
async def create_link(
    payload: LinkCreate,
    db: asyncpg.Connection = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LinkService(LinkQueriesQueries(db))
    if len(str(payload.original_url)) > 2048:
        raise HTTPException(status_code=400, detail="URL is TOO LONG")
    try:
        new_link = await service.create_short_link(
            original_url=str(payload.original_url),
            user_id=current_user.id
        )
        return new_link
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка"
        )

@router.get("/", response_model=LinkList)
async def list_my_links(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None, min_length=3, alias='original_url'),
    is_active: bool | None = Query(None),
    order_by: Literal['created_at'] = 'created_at', # TODO +clicks
    order_dir: Literal['asc', 'desc'] = 'desc',
    db: asyncpg.Connection = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LinkService(LinkQueriesQueries(db))
    try:
        links = await service.get_user_links(
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            original_url=search,
            is_active=is_active,
            order_by=order_by,
            order_dir=order_dir
        )
        total = await service.get_links_total(
            user_id=current_user.id,
            original_url=search,
            is_active=is_active
        )

        return {
            'links': links,
            'total': total
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Внутренняя ошибка при получении списка ссылок'
        )
    
@router.delete("/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_link(
    short_code: str,
    db: asyncpg.Connection = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LinkService(LinkQueriesQueries(db))
    try:
        is_deleted = await service.delete_link(short_code=short_code, user_id=current_user.id)
    except Exception as e:
        print(f'Ошибка удаления: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Внутренняя ошибка при удалении ссылки'
        )
    if not is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Ссылка не найдена или у вас нет прав на ее удаление'
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{short_code}/qr")
async def get_link_qr(
    short_code: str,
    fmt: str = Query("png", pattern="^(png|svg)$"),
    scale: int = Query(10, ge=1, le=50, description="Масштаб QR-кода"),
    db: asyncpg.Connection = Depends(get_db),
    redis_client: redis.Redis = Depends(get_bin_redis)
):
    cache_key = f"qr:{short_code}:{fmt}:{scale}"
    cached_qr = await redis_client.get(cache_key)

    mime_type = "image/png" if fmt == 'png' else 'image/svg+xml'

    if cached_qr:
        return Response(content=cached_qr, media_type=mime_type)

    service = LinkService(LinkQueriesQueries(db))
    link_exists = await service.exists(short_code)
    if not link_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Короткая ссылка не найдена'
        )
    qr_buf, generated_mime = service.generate_qr_code(short_code, scale, fmt)
    try:
        qr_bytes = qr_buf.getvalue()
    finally:
        qr_buf.close()

    duration_seconds = 604800 # Неделя
    await redis_client.setex(cache_key, duration_seconds, qr_bytes)

    return Response(content=qr_bytes, media_type=generated_mime)
