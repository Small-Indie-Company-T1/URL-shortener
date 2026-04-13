
from src.db import models
import asyncpg
import dataclasses
import datetime
import uuid



@dataclasses.dataclass
class JwtQueriesQueries:
    connection: asyncpg.Connection

    CREATESESSION = """
        INSERT INTO user_sessions (id, user_id, refresh_token, expires_at, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, refresh_token, expires_at, created_at, user_agent, is_revoked
    """
    GETSESSION = """
        SELECT id, user_id, refresh_token, expires_at, created_at, user_agent, is_revoked FROM user_sessions
        WHERE id = $1 LIMIT 1
    """
    REVOKEUSERSESSIONBYID = """
        UPDATE user_sessions
        SET is_revoked = TRUE
        WHERE id = $1
    """
    REVOKEUSERSESSIONS = """
        UPDATE user_sessions
        SET is_revoked = TRUE
        WHERE user_id = $1
    """
    REVOKESESSIONSBYUA = """
        UPDATE user_sessions
        SET is_revoked = TRUE
        WHERE user_id = $1 AND user_agent = $2 AND is_revoked = FALSE
    """
    UPDATEUSERSESSION = """
        UPDATE user_sessions
        SET refresh_token = $1, expires_at = $2, user_agent = $3
        WHERE id = $4
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateSession(self, id: uuid.UUID, user_id: uuid.UUID, refresh_token: str, expires_at: datetime.datetime, user_agent: str | None) -> models.public.UserSessions | None:
        row = await self.connection.fetchrow(
            self.CREATESESSION, id, user_id, refresh_token, expires_at, user_agent
        )
        if row is None:
            return None
        return models.public.UserSessions(
            created_at=row["created_at"],
            expires_at=row["expires_at"],
            id=row["id"],
            is_revoked=row["is_revoked"],
            refresh_token=row["refresh_token"],
            user_agent=row["user_agent"],
            user_id=row["user_id"],
        )
    async def GetSession(self, id: uuid.UUID) -> models.public.UserSessions | None:
        row = await self.connection.fetchrow(
            self.GETSESSION, id
        )
        if row is None:
            return None
        return models.public.UserSessions(
            created_at=row["created_at"],
            expires_at=row["expires_at"],
            id=row["id"],
            is_revoked=row["is_revoked"],
            refresh_token=row["refresh_token"],
            user_agent=row["user_agent"],
            user_id=row["user_id"],
        )
    async def RevokeUserSessionByID(self, id: uuid.UUID) -> str:
        return await self.connection.exec(
            self.REVOKEUSERSESSIONBYID, id
        )
    async def RevokeUserSessions(self, user_id: uuid.UUID) -> str:
        return await self.connection.exec(
            self.REVOKEUSERSESSIONS, user_id
        )
    async def RevokeSessionsByUA(self, user_id: uuid.UUID, user_agent: str | None) -> str:
        return await self.connection.exec(
            self.REVOKESESSIONSBYUA, user_id, user_agent
        )
    async def UpdateUserSession(self, refresh_token: str, expires_at: datetime.datetime, user_agent: str | None, id: uuid.UUID) -> str:
        return await self.connection.exec(
            self.UPDATEUSERSESSION, refresh_token, expires_at, user_agent, id
        )


@dataclasses.dataclass
class LinkQueriesQueries:
    connection: asyncpg.Connection

    CREATELINK = """
        INSERT INTO links (creator_id, original_url, short_code)
        VALUES ($1, $2, $3)
        RETURNING id, creator_id, original_url, short_code, created_at, is_active, is_deleted
    """
    GETLINKSBYUSERID = """
        SELECT id, creator_id, original_url, short_code, created_at, is_active, is_deleted FROM links
        WHERE creator_id = $1 AND is_deleted = false
        ORDER BY created_at DESC
    """
    GETLINKBYCODE = """
        SELECT id, creator_id, original_url, short_code, created_at, is_active, is_deleted FROM links
        WHERE short_code = $1 AND is_deleted = false
        LIMIT 1
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
    async def GetLinksByUserId(self, creator_id: uuid.UUID) -> list[models.public.Links]:
        rows = await self.connection.fetch(
            self.GETLINKSBYUSERID, creator_id
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
    jwt_queries: JwtQueriesQueries
    link_queries: LinkQueriesQueries
    user_queries: UserQueriesQueries

    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection
        self.jwt_queries = JwtQueriesQueries(connection)
        self.link_queries = LinkQueriesQueries(connection)
        self.user_queries = UserQueriesQueries(connection)

    