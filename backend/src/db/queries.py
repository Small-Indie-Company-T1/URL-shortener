
from src.db import models
import asyncpg
import dataclasses
import datetime
import typing
import uuid



@dataclasses.dataclass
class ClickQueriesQueries:
    connection: asyncpg.Connection

    CREATECLICK = """
        INSERT INTO clicks (link_id, user_agent, referred_from, ip_address)
        VALUES ($1, $2, $3, $4)
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateClick(self, link_id: uuid.UUID, user_agent: str | None, referred_from: str | None, ip_address: typing.Any | None) -> str:
        return await self.connection.exec(
            self.CREATECLICK, link_id, user_agent, referred_from, ip_address
        )


@dataclasses.dataclass
class LinkQueriesQueries:
    connection: asyncpg.Connection

    CREATELINK = """
        INSERT INTO links (creator_id, original_url, short_code)
        VALUES ($1, $2, $3)
        RETURNING id, creator_id, original_url, short_code, created_at, is_active, is_deleted
    """
    GETLINKSCOUNTBYUSERID = """
        SELECT COUNT(*) FROM links
        WHERE creator_id = $1
            AND is_deleted = false
            AND (
                original_url ILIKE '%' || $2 || '%' 
                OR $2 IS NULL
            )
            AND (
                is_active = $3 
                OR $3 IS NULL
            )
    """
    CHECKLINKEXISTS = """
        SELECT EXISTS(
            SELECT 1 FROM links
            WHERE short_code = $1 AND is_deleted = false
        )
    """
    GETLINKSBYUSERID = """
        SELECT id, creator_id, original_url, short_code, created_at, is_active, is_deleted FROM links
        WHERE creator_id = $1
            AND is_deleted = false
            AND (
                original_url ILIKE '%' || $2 || '%' 
                OR $2 IS NULL
            )
            AND (
                is_active = $3
                OR $3 IS NULL
            )
        ORDER BY
            CASE WHEN $4::text = 'created_at' AND $5::text = 'asc' THEN created_at END ASC,
            CASE WHEN $4::text = 'created_at' AND $5::text = 'desc' THEN created_at END DESC,
            -- CASE WHEN $6 = 'clicks' AND $7 = 'asc' THEN clicks END ASC,
            -- CASE WHEN $6 = 'clicks' AND $7 = 'asc' THEN clicks END DESC,
            created_at DESC
        LIMIT $7 OFFSET $6
    """
    GETLINKBYCODE = """
        SELECT id, creator_id, original_url, short_code, created_at, is_active, is_deleted FROM links
        WHERE short_code = $1 AND is_deleted = false
        LIMIT 1
    """
    DELETELINK = """
        UPDATE links
        SET is_deleted = true
        WHERE short_code = $1 AND creator_id = $2
        RETURNING id
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateLink(self, creator_id: uuid.UUID, original_url: str, short_code: str) -> models.public.Links | None:
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
    async def GetLinksCountByUserId(self, creator_id: uuid.UUID, original_url: str | None, is_active: bool | None) -> models.link_queries_queries.GetlinkscountbyuseridRow | None:
        row = await self.connection.fetchrow(
            self.GETLINKSCOUNTBYUSERID, creator_id, original_url, is_active
        )
        if row is None:
            return None
        return models.link_queries_queries.GetlinkscountbyuseridRow(
            count=row["count"],
        )
    async def CheckLinkExists(self, short_code: str) -> models.link_queries_queries.ChecklinkexistsRow | None:
        row = await self.connection.fetchrow(
            self.CHECKLINKEXISTS, short_code
        )
        if row is None:
            return None
        return models.link_queries_queries.ChecklinkexistsRow(
            exists=row["exists"],
        )
    async def GetLinksByUserId(self, creator_id: uuid.UUID, original_url: str | None, is_active: bool | None, order_by: str, order_dir: str, offset: int | None, limit: int | None) -> list[models.public.Links]:
        rows = await self.connection.fetch(
            self.GETLINKSBYUSERID, creator_id, original_url, is_active, order_by, order_dir, offset, limit
        )
        return [
            models.public.Links(
                created_at=row["created_at"],
                creator_id=row["creator_id"],
                id=row["id"],
                is_active=row["is_active"],
                is_deleted=row["is_deleted"],
                original_url=row["original_url"],
                short_code=row["short_code"],
            )
            for row in rows
        ]
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
    async def DeleteLink(self, short_code: str, creator_id: uuid.UUID) -> models.link_queries_queries.DeletelinkRow | None:
        row = await self.connection.fetchrow(
            self.DELETELINK, short_code, creator_id
        )
        if row is None:
            return None
        return models.link_queries_queries.DeletelinkRow(
            id=row["id"],
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
    GETUSERBYID = """
        SELECT id, nickname, email, password, created_at, is_deleted FROM users WHERE id = $1 LIMIT 1
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
    async def GetUserById(self, id: uuid.UUID) -> models.public.Users | None:
        row = await self.connection.fetchrow(
            self.GETUSERBYID, id
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
    click_queries: ClickQueriesQueries
    link_queries: LinkQueriesQueries
    user_queries: UserQueriesQueries

    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection
        self.click_queries = ClickQueriesQueries(connection)
        self.link_queries = LinkQueriesQueries(connection)
        self.user_queries = UserQueriesQueries(connection)

    