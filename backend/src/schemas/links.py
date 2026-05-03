from typing import List

from pydantic import BaseModel, HttpUrl, field_validator
import os
from datetime import datetime
import uuid

class LinkCreate(BaseModel):
    original_url: HttpUrl

    @field_validator('original_url')
    @classmethod
    def prevent_self_shortening(cls, v: HttpUrl):
        own_domain = os.getenv("BASE_URL") if os.getenv("BASE_URL") else "localhost:8080"
        if own_domain in str(v):
            raise ValueError("you can't shorten link to this particular website")
        return v

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

class LinkList(BaseModel):
    links: List[LinkRead]
    total: int

class LinkStats(BaseModel):
    short_code: str
    clicks_count: int
    unique_ip_clicks_count: int