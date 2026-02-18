"""Add deal_id to Activity model.

Revision ID: 006_add_deal_id_to_activity
Revises: 005_add_notes
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006_add_deal_id_to_activity'
down_revision: Union[str, None] = '005_add_notes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deal_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_activities_deals', 'deals', ['deal_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.drop_constraint('fk_activities_deals', type_='foreignkey')
        batch_op.drop_column('deal_id')
