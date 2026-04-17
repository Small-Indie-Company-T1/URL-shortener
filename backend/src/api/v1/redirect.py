from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, status
from fastapi.responses import RedirectResponse
import asyncpg

from src.db.database import get_db
from src.db.queries import LinkQueriesQueries
from src.services.analytics import log_click_task, get_real_ip

router = APIRouter()

@router.get("/{short_code}", tags=["redirect"])
async def redirect_to_full_url(
        short_code: str,
        request: Request,
        background_tasks: BackgroundTasks,
        db: asyncpg.Connection = Depends(get_db)
):
    link_querier = LinkQueriesQueries(db)

    link = await link_querier.GetLinkByCode(short_code)

    if not link:
        return RedirectResponse(url="/404", status_code=status.HTTP_302_FOUND)

    pool = request.app.state.pool
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")
    ip_address = get_real_ip(request)

    background_tasks.add_task(
        log_click_task,
        pool,
        link.id,
        user_agent,
        referer,
        ip_address
    )

    return RedirectResponse(
        url=link.original_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT
    )