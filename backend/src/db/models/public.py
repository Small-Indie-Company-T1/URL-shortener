import dataclasses
import datetime
import typing


@dataclasses.dataclass
class Users:
    created_at: datetime.datetime
    email: str
    id: typing.Any # use "bigserial" to remap this type in your sqlc.yaml file
    is_deleted: bool
    nickname: str
    password: bytes

@dataclasses.dataclass
class Links:
    created_at: datetime.datetime
    creator_id: int
    id: typing.Any # use "bigserial" to remap this type in your sqlc.yaml file
    is_active: bool
    is_deleted: bool
    original_url: str
    short_code: str

@dataclasses.dataclass
class Clicks:
    clicked_at: datetime.datetime
    id: typing.Any # use "bigserial" to remap this type in your sqlc.yaml file
    ip_address: str | None
    link_id: int
    referred_from: str | None
    user_agent: str | None
