
from src.db import models
import asyncpg
import dataclasses
import datetime
import typing



@dataclasses.dataclass
class LinkQueriesQueries:
    connection: asyncpg.Connection

    CREATELINK = """
        INSERT INTO links (creator_id, original_url, short_code)
        VALUES ($1, $2, $3)
        RETURNING id, creator_id, original_url, short_code, created_at, is_active, is_deleted
    """
    GETLINKBYCODE = """
        SELECT id, creator_id, original_url, short_code, created_at, is_active, is_deleted FROM links
        WHERE short_code = $1 AND is_deleted = false
        LIMIT 1
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateLink(self, creator_id: int, original_url: str, short_code: str) -> models.public.Links | None:
        row = await self.connection.fetchrow(
            self.CREATELINK, creator_id, original_url, short_code
        )
        if row is None:
            return None
        return models.public.Links(
            created_at=row["created_at"],
            creator_id=row["creator_id"],
            id=row["id"],
            is_active=row["is_active"],
            is_deleted=row["is_deleted"],
            original_url=row["original_url"],
            short_code=row["short_code"],
        )
    async def GetLinkByCode(self, short_code: str) -> models.public.Links | None:
        row = await self.connection.fetchrow(
            self.GETLINKBYCODE, short_code
        )
        if row is None:
            return None
        return models.public.Links(
            created_at=row["created_at"],
            creator_id=row["creator_id"],
            id=row["id"],
            is_active=row["is_active"],
            is_deleted=row["is_deleted"],
            original_url=row["original_url"],
            short_code=row["short_code"],
        )


@dataclasses.dataclass
class UserQueriesQueries:
    connection: asyncpg.Connection

    CREATEUSER = """
        INSERT INTO users (nickname, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, nickname, email, password, created_at, is_deleted
    """
    GETUSERBYEMAIL = """
        SELECT id, nickname, email, password, created_at, is_deleted FROM users WHERE email = $1 LIMIT 1
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateUser(self, nickname: str, email: str, password: bytes) -> models.public.Users | None:
        row = await self.connection.fetchrow(
            self.CREATEUSER, nickname, email, password
        )
        if row is None:
            return None
        return models.public.Users(
            created_at=row["created_at"],
            email=row["email"],
            id=row["id"],
            is_deleted=row["is_deleted"],
            nickname=row["nickname"],
            password=row["password"],
        )
    async def GetUserByEmail(self, email: str) -> models.public.Users | None:
        row = await self.connection.fetchrow(
            self.GETUSERBYEMAIL, email
        )
        if row is None:
            return None
        return models.public.Users(
            created_at=row["created_at"],
            email=row["email"],
            id=row["id"],
            is_deleted=row["is_deleted"],
            nickname=row["nickname"],
            password=row["password"],
        )

@dataclasses.dataclass
class Queries:
    connection: asyncpg.Connection
    link_queries: LinkQueriesQueries
    user_queries: UserQueriesQueries

    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection
        self.link_queries = LinkQueriesQueries(connection)
        self.user_queries = UserQueriesQueries(connection)

    