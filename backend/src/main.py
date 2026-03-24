from fastapi import FastAPI
from src.api.v1.links import router as links_router

app = FastAPI()

app.include_router(links_router, prefix="/api/v1")

@app.get("/healthcheck", tags=["Health"])
async def health_check():
    return {"status": "ok"}