"""add clicks_count to links

Revision ID: ce25199bf20b
Revises: ebbc9e14bca9
Create Date: 2026-05-04 01:58:52.026363

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce25199bf20b'
down_revision: Union[str, Sequence[str], None] = 'ebbc9e14bca9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('links', sa.Column('clicks_count', sa.Integer(), nullable=True, server_default='0'))
    op.execute("UPDATE links SET clicks_count = (SELECT count(*) FROM clicks WHERE clicks.link_id = links.id)")
    op.execute("UPDATE links SET clicks_count = 0 WHERE clicks_count IS NULL")
    op.alter_column('links', 'clicks_count', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('links', 'clicks_count')
