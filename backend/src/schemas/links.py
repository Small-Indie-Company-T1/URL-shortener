from pydantic import BaseModel, HttpUrl
from datetime import datetime
import uuid

class LinkCreate(BaseModel):
    original_url: HttpUrl

class LinkRead(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    original_url: str
    short_code: str
    created_at: datetime
    is_active: bool
    is_deleted: bool

    class Config:
        from_attributes = True