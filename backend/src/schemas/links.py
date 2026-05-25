from typing import List
from urllib.parse import urlparse

from pydantic import BaseModel, HttpUrl, field_validator
import os
from datetime import datetime
import uuid

from src.core.config import settings

class LinkCreate(BaseModel):
    original_url: HttpUrl

    @field_validator('original_url')
    @classmethod
    def prevent_self_shortening(cls, v: HttpUrl):
        target_host = urlparse(str(v)).netloc.lower()
        own_host = urlparse(settings.BASE_URL).netloc.lower()
        if target_host == own_host:
            raise ValueError("you can't shorten link to this particular webside")
        return v

class LinkRead(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    original_url: str
    short_code: str
    created_at: datetime
    is_active: bool
    is_deleted: bool
    clicks_count: int

    class Config:
        from_attributes = True

class LinkList(BaseModel):
    links: List[LinkRead]
    total: int

class LinkStats(BaseModel):
    short_code: str
    clicks_count: int
    unique_ip_clicks_count: int