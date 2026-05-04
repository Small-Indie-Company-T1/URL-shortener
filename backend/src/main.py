from contextlib import asynccontextmanager

import asyncpg
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from src.core.exceptions.service_exceptions import ServiceException
from src.core.exceptions.app_exceptions import AppException
from src.core.logger import setup_logging, logger
from src.core.config import settings
from src.api.v1.links import router as links_router
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1 import auth, redirect, clicks


setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL_SYNC,
        min_size=5,
        max_size=20
    )

    app.state.pool = pool
    logger.info("db pool is connected")

    try:
        yield
    finally:
        await pool.close()
        logger.info("db pool is closed")

app = FastAPI(title="url shortener", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(links_router, prefix="/links", tags=["links"])

@app.get("/healthcheck", tags=["Health"])
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(redirect.router, prefix="/redirect")
app.include_router(clicks.router, prefix="/stats")

@app.get("/")
async def root():
    return {"message": "hi there"}

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    status_code = getattr(exc, 'status_code', 500)
    if isinstance(exc, ServiceException):
        logger.warning(f'Business logic error: {exc.message}')
    else:
        logger.error(f'System error: {exc.message}', exc_info=True)
    return JSONResponse(
        status_code=status_code,
        content={'detail': exc.message}
    )

@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    logger.exception("UNHANDLED CRITICAL ERROR")
    return JSONResponse(
        status_code=500,
        content={'detail': 'Внутренняя ошибка сервера.'}
    )
