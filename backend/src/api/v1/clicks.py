from typing import List

import asyncpg
from fastapi import APIRouter, Depends, status

from src.core.exceptions.service_exceptions import ForbiddenException, NotFoundException
from src.schemas.clicks import ClickRead
from src.schemas.links import LinkStats
from src.db.queries import ClickQueriesQueries
from src.db.queries import LinkQueriesQueries
from src.db.database import get_db
from src.api.deps import get_current_user


router = APIRouter()

@router.get("/{short_code}", response_model=LinkStats, status_code=status.HTTP_200_OK, tags=["stats"])
async def get_link_stats(
        short_code: str,
        db: asyncpg.Connection = Depends(get_db),
        current_user=Depends(get_current_user)
):
    link_service = LinkQueriesQueries(db)
    click_service = ClickQueriesQueries(db)

    link = await link_service.GetLinkByCode(short_code)
    if not link:
        raise NotFoundException('Link not found')

    if link.creator_id != current_user.id:
        raise ForbiddenException("you are not allowed to view the stats for this link")

    total_raw = await click_service.GetTotalClicksByLinkId(link.id)
    total_count = total_raw.count if hasattr(total_raw, 'count') else total_raw

    unique_raw = await click_service.GetUniqueIPClickStats(link.id)
    unique_count = unique_raw.count if hasattr(unique_raw, 'count') else unique_raw

    return {
        "short_code": short_code,
        "clicks_count": int(total_count),
        "unique_ip_clicks_count": int(unique_count)
    }

@router.get("/{short_code}/list", response_model=List[ClickRead])
async def get_clicks_history(
        short_code: str,
        limit: int = 10,
        offset: int = 0,
        db: asyncpg.Connection = Depends(get_db),
        current_user=Depends(get_current_user)
):
    link_service = LinkQueriesQueries(db)
    click_service = ClickQueriesQueries(db)

    link = await link_service.GetLinkByCode(short_code)
    if not link or link.creator_id != current_user.id:
        raise ForbiddenException("Access denied")

    clicks = await click_service.GetLatestClicksByLinkId(
        link.id,
        limit,
        offset
    )

    return clicks
