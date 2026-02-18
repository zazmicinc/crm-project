"""Add accounts table and relationships.

Revision ID: 002_add_accounts
Revises: 001_initial_schema
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_accounts'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Accounts ─────────────────────────────────────────────────────
    op.create_table(
        'accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_id'), 'accounts', ['id'], unique=False)
    op.create_index(op.f('ix_accounts_name'), 'accounts', ['name'], unique=False)

    # ── Update Contacts ──────────────────────────────────────────────
    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('account_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_contacts_accounts', 'accounts', ['account_id'], ['id'])

    # ── Update Deals ─────────────────────────────────────────────────
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.add_column(sa.Column('account_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_deals_accounts', 'accounts', ['account_id'], ['id'])


def downgrade() -> None:
    # ── Downgrade Deals ──────────────────────────────────────────────
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.drop_constraint('fk_deals_accounts', type_='foreignkey')
        batch_op.drop_column('account_id')

    # ── Downgrade Contacts ───────────────────────────────────────────
    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_contacts_accounts', type_='foreignkey')
        batch_op.drop_column('account_id')

    # ── Downgrade Accounts ───────────────────────────────────────────
    op.drop_index(op.f('ix_accounts_name'), table_name='accounts')
    op.drop_index(op.f('ix_accounts_id'), table_name='accounts')
    op.drop_table('accounts')
