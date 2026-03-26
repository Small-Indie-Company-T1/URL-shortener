import dataclasses
import datetime
import typing
import uuid


@dataclasses.dataclass
class Users:
    created_at: datetime.datetime
    email: str
    id: uuid.UUID
    is_deleted: bool
    nickname: str
    password: bytes

@dataclasses.dataclass
class UserSessions:
    created_at: datetime.datetime | None
    expires_at: datetime.datetime
    id: uuid.UUID
    is_revoked: bool | None
    refresh_token: str
    user_agent: str | None
    user_id: uuid.UUID

@dataclasses.dataclass
class Links:
    created_at: datetime.datetime
    creator_id: uuid.UUID
    id: uuid.UUID
    is_active: bool
    is_deleted: bool
    original_url: str
    short_code: str

@dataclasses.dataclass
class Clicks:
    clicked_at: datetime.datetime
    id: uuid.UUID
    ip_address: typing.Any | None # use "inet" to remap this type in your sqlc.yaml file
    link_id: uuid.UUID
    referred_from: str | None
    user_agent: str | None
