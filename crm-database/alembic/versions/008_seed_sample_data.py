"""Seed sample data.

Revision ID: 008_seed_sample_data
Revises: 007_add_auth
Create Date: 2026-02-18
"""
from typing import Sequence, Union
from datetime import datetime, timezone, timedelta
import random

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from passlib.context import CryptContext

# revision identifiers, used by Alembic.
revision: str = '008_seed_sample_data'
down_revision: Union[str, None] = '007_add_auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def upgrade() -> None:
    # Get connection
    bind = op.get_bind()
    meta = sa.MetaData()
    
    # Reflect tables
    try:
        # We need to reflect tables to insert data safely
        # Defining minimal table structures for bulk_insert
        roles_table = table('roles', column('id'), column('name'))
        users_table = table('users', column('id'), column('email'), column('first_name'), column('last_name'), column('password_hash'), column('role_id'), column('is_active'), column('created_at'), column('updated_at'))
        accounts_table = table('accounts', column('id'), column('name'), column('industry'), column('website'), column('phone'), column('email'), column('address'), column('owner_id'), column('created_at'), column('updated_at'))
        contacts_table = table('contacts', column('id'), column('name'), column('email'), column('phone'), column('company'), column('notes'), column('account_id'), column('owner_id'), column('created_at'), column('updated_at'))
        leads_table = table('leads', column('id'), column('first_name'), column('last_name'), column('email'), column('phone'), column('company'), column('status'), column('source'), column('owner_id'), column('created_at'), column('updated_at'))
        pipelines_table = table('pipelines', column('id'), column('name'), column('is_default'), column('created_at'), column('updated_at'))
        stages_table = table('stages', column('id'), column('pipeline_id'), column('name'), column('order'), column('probability'), column('created_at'), column('updated_at'))
        deals_table = table('deals', column('id'), column('title'), column('value'), column('stage'), column('contact_id'), column('account_id'), column('pipeline_id'), column('stage_id'), column('owner_id'), column('created_at'), column('updated_at'))
        
        # 1. Ensure Roles exist and get IDs
        # We assume roles were seeded in 007. We fetch them.
        rows = bind.execute(sa.select(roles_table.c.id, roles_table.c.name)).fetchall()
        role_map = {r.name: r.id for r in rows}
        
        if not role_map:
             print("Skipping seed: Roles not found.")
             return

        # 2. Create Users (Admin, Sales Rep)
        # Check if users exist to avoid duplicates
        existing_users = bind.execute(sa.select(users_table.c.email)).fetchall()
        existing_emails = {u.email for u in existing_users}
        
        new_users = []
        user_ids = {} # email -> id (will be fetched after insert ideally, but here we can only bulk insert)
        
        # We will insert and then re-fetch.
        
        password_hash = pwd_context.hash("password123")
        now = datetime.now(timezone.utc)
        
        users_to_create = [
            {"email": "admin@crm.com", "first_name": "System", "last_name": "Admin", "role_name": "Admin"},
            {"email": "alice@crm.com", "first_name": "Alice", "last_name": "Sales", "role_name": "Sales Rep"},
            {"email": "bob@crm.com", "first_name": "Bob", "last_name": "Viewer", "role_name": "Viewer"},
        ]
        
        for u in users_to_create:
            if u["email"] not in existing_emails:
                op.execute(
                    users_table.insert().values(
                        email=u["email"],
                        first_name=u["first_name"],
                        last_name=u["last_name"],
                        password_hash=password_hash,
                        role_id=role_map.get(u["role_name"], role_map.get("Admin")),
                        is_active=True,
                        created_at=now,
                        updated_at=now
                    )
                )

        # Re-fetch users to get IDs
        user_rows = bind.execute(sa.select(users_table.c.id, users_table.c.email)).fetchall()
        user_map = {u.email: u.id for u in user_rows}
        admin_id = user_map.get("admin@crm.com")
        sales_id = user_map.get("alice@crm.com", admin_id)
        
        # 3. Create Pipeline if not exists (Default)
        # Check if any pipeline exists
        has_pipeline = bind.execute(sa.select(pipelines_table.c.id).limit(1)).scalar()
        pipeline_id = has_pipeline
        
        if not has_pipeline:
            res = bind.execute(
                pipelines_table.insert().values(
                    name="Standard Sales Pipeline",
                    is_default=True,
                    created_at=now,
                    updated_at=now
                )
            )
            # Retrieve last inserted id (sqlite specific trick or generic)
            # In alembic, .inserted_primary_key not directly available on result of execute in some contexts
            # We'll just fetch it.
            pipeline_id = bind.execute(sa.select(pipelines_table.c.id).where(pipelines_table.c.name=="Standard Sales Pipeline")).scalar()
            
            # Create Stages
            stages_data = [
                {"name": "Prospecting", "order": 0, "probability": 10},
                {"name": "Qualification", "order": 1, "probability": 30},
                {"name": "Proposal", "order": 2, "probability": 60},
                {"name": "Negotiation", "order": 3, "probability": 80},
                {"name": "Closed Won", "order": 4, "probability": 100},
                {"name": "Closed Lost", "order": 5, "probability": 0},
            ]
            for s in stages_data:
                op.execute(
                    stages_table.insert().values(
                        pipeline_id=pipeline_id,
                        name=s["name"],
                        order=s["order"],
                        probability=s["probability"],
                        created_at=now,
                        updated_at=now
                    )
                )

        # Get stage IDs
        stage_rows = bind.execute(sa.select(stages_table.c.id, stages_table.c.name).where(stages_table.c.pipeline_id == pipeline_id)).fetchall()
        stage_map = {s.name: s.id for s in stage_rows} # Name -> ID
        # Also Enum mapping for backward compat if needed, but we use stage_id FK now.
        
        # 4. Check if data exists (Accounts)
        if bind.execute(sa.select(accounts_table.c.id).limit(1)).scalar():
             print("Data exists, skipping sample data seed.")
             return

        # 5. Insert Accounts
        accounts_data = []
        for i in range(1, 11):
            accounts_data.append({
                "name": f"Sample Account {i}",
                "industry": "Technology" if i % 2 == 0 else "Retail",
                "website": f"https://account{i}.com",
                "phone": f"555-010{i}",
                "email": f"info@account{i}.com",
                "address": f"{i} Main St, Cityville",
                "owner_id": sales_id,
                "created_at": now - timedelta(days=i),
                "updated_at": now
            })
        
        op.bulk_insert(accounts_table, accounts_data)
        
        # Fetch Account IDs
        acct_rows = bind.execute(sa.select(accounts_table.c.id)).fetchall()
        acct_ids = [r.id for r in acct_rows]

        # 6. Insert Contacts
        contacts_data = []
        for i in range(1, 11):
            contacts_data.append({
                "name": f"Contact Person {i}",
                "email": f"contact{i}@example.com",
                "phone": f"555-020{i}",
                "company": f"Sample Account {i}",
                "notes": "Key stakeholder",
                "account_id": acct_ids[i-1] if i-1 < len(acct_ids) else None,
                "owner_id": sales_id,
                "created_at": now - timedelta(days=i),
                "updated_at": now
            })
        op.bulk_insert(contacts_table, contacts_data)
        
        # Fetch Contact IDs
        contact_rows = bind.execute(sa.select(contacts_table.c.id)).fetchall()
        contact_ids = [r.id for r in contact_rows]

        # 7. Insert Leads
        leads_data = []
        for i in range(1, 11):
            leads_data.append({
                "first_name": f"Lead",
                "last_name": f"User {i}",
                "email": f"lead{i}@test.com",
                "phone": f"555-030{i}",
                "company": f"Prospect Co {i}",
                "status": "New",
                "source": "Web",
                "owner_id": sales_id,
                "created_at": now - timedelta(days=i),
                "updated_at": now
            })
        op.bulk_insert(leads_table, leads_data)

        # 8. Insert Deals
        deals_data = []
        for i in range(1, 11):
            # Pick a random stage
            s_name = random.choice(["Prospecting", "Qualification", "Proposal"])
            # Map to enum string for 'stage' column (which is Enum or String in SQLite)
            # and stage_id FK.
            # In models.py 'stage' is Enum("prospecting", ...). Lowercase.
            s_enum = s_name.lower().replace(" ", "_")
            
            deals_data.append({
                "title": f"Deal Opportunity {i}",
                "value": i * 1000.0,
                "stage": s_enum,
                "contact_id": contact_ids[i-1] if i-1 < len(contact_ids) else contact_ids[0],
                "account_id": acct_ids[i-1] if i-1 < len(acct_ids) else None,
                "pipeline_id": pipeline_id,
                "stage_id": stage_map.get(s_name),
                "owner_id": sales_id,
                "created_at": now - timedelta(days=i),
                "updated_at": now
            })
        op.bulk_insert(deals_table, deals_data)
        
        print("Seeded sample data via migration 008.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        # We don't raise, to avoid blocking migration if seed fails (e.g. data conflict)
        pass


def downgrade() -> None:
    # We typically don't delete data in downgrade unless it's strictly schema related.
    # But for seed migration, we might want to clean up?
    # Usually better to leave user data alone.
    pass
