import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="link not found"
        )

    if link.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="you are not allowed to view the stats for this link"
        )

    try:
        total_raw = await click_service.GetTotalClicksByLinkId(link.id)
        total_count = total_raw.count if hasattr(total_raw, 'count') else total_raw

        unique_raw = await click_service.GetUniqueIPClickStats(link.id)
        unique_count = unique_raw.count if hasattr(unique_raw, 'count') else unique_raw

        return {
            "short_code": short_code,
            "clicks_count": int(total_count),
            "unique_ip_clicks_count": int(unique_count)
        }
    except Exception as e:
        print(f"error arised while getting link stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error occurred while getting link stats"
        )


from typing import List

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

    try:
        link = await link_service.GetLinkByCode(short_code)
        if not link or link.creator_id != current_user.id:
            raise PermissionError("Access denied")

        clicks = await click_service.GetLatestClicksByLinkId(
            link.id,
            limit,
            offset
        )

        return clicks
    except PermissionError:
        raise HTTPException(status_code=403, detail="Forbidden")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")