from fastapi import FastAPI
from src.api.v1.links import router as links_router
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1 import auth
from src.db.database import create_db_pool, close_db_pool

app = FastAPI(title="url shortener")

app.include_router(links_router, prefix="/links", tags=["links"])

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

app.include_router(auth.router, prefix="/auth")

@app.get("/")
async def root():
    return {"message": "hi there"}
