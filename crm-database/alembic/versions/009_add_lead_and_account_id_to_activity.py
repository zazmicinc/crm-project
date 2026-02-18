"""Add lead_id and account_id to activities.

Revision ID: 009_add_lead_and_account_id_to_activity
Revises: 008_seed_sample_data
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '009_add_lead_and_account_id_to_activity'
down_revision: Union[str, None] = '008_seed_sample_data'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_alter_table for SQLite compatibility
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('lead_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('account_id', sa.Integer(), nullable=True))
        
        # Also make contact_id nullable since an activity might be linked to only a lead or account
        batch_op.alter_column('contact_id',
               existing_type=sa.INTEGER(),
               nullable=True)
               
        batch_op.create_foreign_key('fk_activities_lead', 'leads', ['lead_id'], ['id'])
        batch_op.create_foreign_key('fk_activities_account', 'accounts', ['account_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.drop_constraint('fk_activities_account', type_='foreignkey')
        batch_op.drop_constraint('fk_activities_lead', type_='foreignkey')
        batch_op.alter_column('contact_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.drop_column('account_id')
        batch_op.drop_column('lead_id')
