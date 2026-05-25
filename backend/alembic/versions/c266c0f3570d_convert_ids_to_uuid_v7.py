"""convert_ids_to_uuid_v7

Revision ID: c266c0f3570d
Revises: fcf056d440c8
Create Date: 2026-03-26 16:21:21.639909

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c266c0f3570d'
down_revision: Union[str, Sequence[str], None] = 'fcf056d440c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE clicks DROP CONSTRAINT IF EXISTS clicks_link_id_fkey")
    op.execute("ALTER TABLE links DROP CONSTRAINT IF EXISTS links_creator_id_fkey")

    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING (uuidv7()), 
        ALTER COLUMN id SET DEFAULT uuidv7();
    """)

    op.execute("""
        ALTER TABLE links 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING (uuidv7()),
        ALTER COLUMN id SET DEFAULT uuidv7(),
        ALTER COLUMN creator_id TYPE UUID USING (gen_random_uuid());
    """)

    op.execute("""
        ALTER TABLE clicks 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING (uuidv7()),
        ALTER COLUMN id SET DEFAULT uuidv7(),
        ALTER COLUMN link_id TYPE UUID USING (uuidv7());
    """)

    op.execute("ALTER TABLE links ADD CONSTRAINT links_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id)")
    op.execute("ALTER TABLE clicks ADD CONSTRAINT clicks_link_id_fkey FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS clicks, links, users CASCADE;")
