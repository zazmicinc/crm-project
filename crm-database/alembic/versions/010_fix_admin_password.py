"""Fix admin password to admin123.

Revision ID: 010_fix_admin_password
Revises: 009_add_lead_and_account_id_to_activity
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from passlib.context import CryptContext

# revision identifiers, used by Alembic.
revision: str = '010_fix_admin_password'
down_revision: Union[str, None] = '009_add_lead_and_account_id_to_activity'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def upgrade() -> None:
    users_table = table('users', column('email'), column('password_hash'))
    
    # Hash for 'admin123'
    new_hash = pwd_context.hash("admin123")
    
    op.execute(
        users_table.update().where(
            users_table.c.email == 'admin@crm.com'
        ).values(password_hash=new_hash)
    )


def downgrade() -> None:
    # Revert to 'password123' which was the previous default in migration 008
    users_table = table('users', column('email'), column('password_hash'))
    old_hash = pwd_context.hash("password123")
    
    op.execute(
        users_table.update().where(
            users_table.c.email == 'admin@crm.com'
        ).values(password_hash=old_hash)
    )
