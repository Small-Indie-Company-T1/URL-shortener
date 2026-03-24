"""init_db

Revision ID: fcf056d440c8
Revises: 
Create Date: 2026-03-22 03:50:30.810883

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fcf056d440c8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""DROP TABLE IF EXISTS clicks;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE links (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id),
    original_url VARCHAR(2047) NOT NULL,
    short_code VARCHAR(15) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX links_original_idx ON links (original_url);
CREATE INDEX links_code_idx ON links (short_code);
CREATE INDEX links_creator_idx ON links (creator_id);

CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    user_agent TEXT,
    referred_from TEXT,
    ip_address VARCHAR(63),
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clicks_link_idx ON clicks (link_id);""")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TABLE IF EXISTS clicks, links, users CASCADE;")
