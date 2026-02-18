"""Add leads table.

Revision ID: 003_add_leads
Revises: 002_add_accounts
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_add_leads'
down_revision: Union[str, None] = '002_add_accounts'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'leads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(length=255), nullable=False),
        sa.Column('last_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('status', sa.Enum('New', 'Contacted', 'Qualified', 'Converted', 'Dead', name='lead_status'), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('converted_at', sa.DateTime(), nullable=True),
        sa.Column('converted_to_contact_id', sa.Integer(), nullable=True),
        sa.Column('converted_to_account_id', sa.Integer(), nullable=True),
        sa.Column('converted_to_deal_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['converted_to_account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['converted_to_contact_id'], ['contacts.id'], ),
        sa.ForeignKeyConstraint(['converted_to_deal_id'], ['deals.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leads_email'), 'leads', ['email'], unique=False)
    op.create_index(op.f('ix_leads_id'), 'leads', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_leads_id'), table_name='leads')
    op.drop_index(op.f('ix_leads_email'), table_name='leads')
    op.drop_table('leads')
