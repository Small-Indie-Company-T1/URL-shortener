from fastapi import FastAPI
from src.api.v1.links import router as links_router
from fastapi.middleware.cors import CORSMiddleware
from src.api.endpoints import auth  # Импорт твоего роутера
from src.db.database import create_db_pool, close_db_pool
from src.core.config import settings

app = FastAPI(title="url shortener")

app.include_router(links_router, prefix="/api/v1")

@app.get("/healthcheck", tags=["Health"])
async def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await create_db_pool()

@app.on_event("shutdown")
async def shutdown():
    await close_db_pool()

app.include_router(auth.router, prefix="/auth", tags=["register", "login", "logout"])

@app.get("/")
async def root():
    return {"message": "hi there"}
