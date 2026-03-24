from pydantic import BaseModel, HttpUrl
from datetime import datetime

class LinkCreate(BaseModel):
    original_url: HttpUrl

class LinkRead(BaseModel):
    id: int
    creator_id: int
    original_url: str
    short_code: str
    created_at: datetime
    is_active: bool
    is_deleted: bool

    class Config:
        from_attributes = True