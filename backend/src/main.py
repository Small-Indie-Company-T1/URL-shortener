from contextlib import asynccontextmanager

import asyncpg
from fastapi import FastAPI

from src.core.config import settings
from src.api.v1.links import router as links_router
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1 import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL_SYNC,
        min_size=5,
        max_size=20
    )

    app.state.pool = pool
    print("db pool is connected")

    try:
        yield
    finally:
        await pool.close()
        print("db pool is closed")

app = FastAPI(title="url shortener", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(links_router, prefix="/links", tags=["links"])

@app.get("/healthcheck", tags=["Health"])
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/auth")

@app.get("/")
async def root():
    return {"message": "hi there"}
