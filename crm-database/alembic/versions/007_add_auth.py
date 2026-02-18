"""Add auth tables (roles, users) and owner_id FKs.

Revision ID: 007_add_auth
Revises: 006_add_deal_id_to_activity
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
import json


# revision identifiers, used by Alembic.
revision: str = '007_add_auth'
down_revision: Union[str, None] = '006_add_deal_id_to_activity'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('permissions', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_roles_id'), 'roles', ['id'], unique=False)

    # Seed Roles
    roles_table = table('roles',
        column('name', sa.String),
        column('permissions', sa.JSON)
    )
    op.bulk_insert(roles_table, [
        {
            'name': 'Admin',
            'permissions': json.dumps(["*"])  # Full access
        },
        {
            'name': 'Sales Rep',
            'permissions': json.dumps([
                "contacts.read", "contacts.create", "contacts.update",
                "deals.read", "deals.create", "deals.update", "deals.move",
                "leads.read", "leads.create", "leads.update", "leads.convert",
                "accounts.read", "accounts.create", "accounts.update",
                "activities.read", "activities.create", "activities.update",
                "notes.read", "notes.create", "notes.update"
            ])
        },
        {
            'name': 'Viewer',
            'permissions': json.dumps([
                "contacts.read", "deals.read", "leads.read", "accounts.read", 
                "activities.read", "notes.read"
            ])
        }
    ])

    # 2. Create Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=255), nullable=False),
        sa.Column('last_name', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 3. Add owner_id to Accounts
    with op.batch_alter_table('accounts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('owner_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_accounts_owner', 'users', ['owner_id'], ['id'])

    # 4. Add owner_id to Contacts
    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('owner_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_contacts_owner', 'users', ['owner_id'], ['id'])

    # 5. Add owner_id to Deals
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.add_column(sa.Column('owner_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_deals_owner', 'users', ['owner_id'], ['id'])

    # 6. Add owner_id FK to Leads (column already exists, just add FK)
    with op.batch_alter_table('leads', schema=None) as batch_op:
        # SQLite doesn't support adding FK to existing column easily without recreating.
        # batch_alter_table handles recreation.
        batch_op.create_foreign_key('fk_leads_owner', 'users', ['owner_id'], ['id'])


def downgrade() -> None:
    # Reverse order
    with op.batch_alter_table('leads', schema=None) as batch_op:
        batch_op.drop_constraint('fk_leads_owner', type_='foreignkey')

    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.drop_constraint('fk_deals_owner', type_='foreignkey')
        batch_op.drop_column('owner_id')

    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_contacts_owner', type_='foreignkey')
        batch_op.drop_column('owner_id')

    with op.batch_alter_table('accounts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_accounts_owner', type_='foreignkey')
        batch_op.drop_column('owner_id')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    op.drop_index(op.f('ix_roles_id'), table_name='roles')
    op.drop_table('roles')
