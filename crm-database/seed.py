#!/usr/bin/env python3
"""Seed the CRM database with sample data.

Creates default roles, an admin user, sample contacts, deals, and activities.
Run AFTER migrations: `python seed.py`
"""

import sys
import os
from datetime import datetime, timedelta, timezone
import random

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Contact, Deal, Activity, User, Role, Lead, Account

# For password hashing without importing from app.auth
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crm.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)

# ── Sample Data ──────────────────────────────────────────────────────────────

CONTACTS = [
    {"name": "Alice Johnson", "email": "alice.johnson@techcorp.com", "phone": "+1-555-0101", "company": "TechCorp", "notes": "VP of Engineering. Key decision maker."},
    {"name": "Bob Martinez", "email": "bob.martinez@innovate.io", "phone": "+1-555-0102", "company": "Innovate.io", "notes": "CTO. Interested in enterprise plan."},
    {"name": "Carol Chen", "email": "carol.chen@globalfin.com", "phone": "+1-555-0103", "company": "GlobalFin", "notes": "Director of Operations."},
    {"name": "David Kim", "email": "david.kim@startupxyz.com", "phone": "+1-555-0104", "company": "StartupXYZ", "notes": "Founder. Early-stage startup."},
    {"name": "Eva Schmidt", "email": "eva.schmidt@megacorp.de", "phone": "+49-30-0105", "company": "MegaCorp GmbH", "notes": "Head of Procurement. Based in Berlin."},
    {"name": "Frank Okafor", "email": "frank.okafor@afrotech.ng", "phone": "+234-802-0106", "company": "AfroTech", "notes": "Managing Director. Lagos office."},
    {"name": "Grace Lee", "email": "grace.lee@pacificmedia.com", "phone": "+1-555-0107", "company": "Pacific Media", "notes": "Marketing Director."},
    {"name": "Henry Dubois", "email": "henry.dubois@euroserv.fr", "phone": "+33-1-0108", "company": "EuroServ", "notes": "Account Manager. Paris HQ."},
    {"name": "Iris Nakamura", "email": "iris.nakamura@tokyosoft.jp", "phone": "+81-3-0109", "company": "TokyoSoft", "notes": "Senior Engineer. Evaluating APIs."},
    {"name": "Jack Thompson", "email": "jack.thompson@buildit.com", "phone": "+1-555-0110", "company": "BuildIt Inc", "notes": "Product Manager."},
]

LEADS = [
    {"first_name": "Sarah", "last_name": "Connor", "email": "s.connor@resistance.net", "company": "Cyberdyne", "status": "New", "source": "Web"},
    {"first_name": "Tony", "last_name": "Stark", "email": "tony@stark.com", "company": "Stark Industries", "status": "Qualified", "source": "Referral"},
    {"first_name": "Bruce", "last_name": "Wayne", "email": "bruce@wayneent.com", "company": "Wayne Enterprises", "status": "Contacted", "source": "Web"},
    {"first_name": "Diana", "last_name": "Prince", "email": "diana@themyscira.gov", "company": "Museum of Antiquities", "status": "New", "source": "Conference"},
    {"first_name": "Clark", "last_name": "Kent", "email": "clark@dailyplanet.com", "company": "Daily Planet", "status": "New", "source": "Cold Outreach"},
]

STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]

DEAL_TEMPLATES = [
    ("Enterprise License", 50000), ("Professional Plan", 25000), ("Starter Package", 5000),
    ("Annual Subscription", 12000), ("Consulting Engagement", 30000), ("API Integration", 18000),
    ("Data Migration", 8000), ("Training Program", 6500), ("Custom Development", 45000),
    ("Support Contract", 15000),
]

ACTIVITY_TEMPLATES = [
    ("call", "Intro call", "Initial discovery call to understand requirements"),
    ("email", "Welcome email", "Sent welcome package and pricing info"),
    ("meeting", "Product demo", "30-minute live demo of the platform"),
    ("call", "Follow-up call", "Discussed feedback from the demo"),
    ("email", "Proposal sent", "Sent formal proposal with pricing breakdown"),
    ("meeting", "Negotiation meeting", "Discussed contract terms and timeline"),
    ("call", "Budget review", "Reviewed budget allocation with finance team"),
    ("email", "Case study shared", "Sent relevant customer success story"),
    ("meeting", "Technical deep dive", "Architecture review with engineering team"),
    ("call", "Check-in call", "Monthly relationship check-in"),
]


def seed():
    """Insert seed data into the database."""
    db = Session()

    # 1. Create Default Admin User
    admin_user = db.query(User).filter(User.email == "admin@crm.com").first()
    if not admin_user:
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            print("⚠️  Admin role missing. Run migrations first.")
            db.close()
            return
            
        admin_user = User(
            email="admin@crm.com",
            first_name="System",
            last_name="Admin",
            password_hash=pwd_context.hash("admin123"),
            role_id=admin_role.id
        )
        db.add(admin_user)
        db.flush()
        print(f"✅ Created default admin user: admin@crm.com / admin123")

    # 2. Sample Data
    if db.query(Contact).count() > 0:
        print("⚠️  Database already has contacts. Skipping sample data seed.")
        db.close()
        return

    now = datetime.now(timezone.utc)

    # ── Create Accounts ──────────────────────────────────────────────
    accounts = []
    for c in CONTACTS[:5]:
        account = Account(
            name=c["company"],
            industry="Technology",
            owner_id=admin_user.id,
            created_at=now - timedelta(days=100)
        )
        db.add(account)
        accounts.append(account)
    db.flush()
    print(f"✅ Created {len(accounts)} accounts")

    # ── Create Contacts ──────────────────────────────────────────────
    contacts = []
    for i, c in enumerate(CONTACTS):
        contact = Contact(
            **c,
            account_id=accounts[i % len(accounts)].id if i < 5 else None,
            owner_id=admin_user.id,
            created_at=now - timedelta(days=90 - i * 4),
            updated_at=now - timedelta(days=max(0, 30 - i * 2)),
        )
        db.add(contact)
        contacts.append(contact)

    db.flush()
    print(f"✅ Created {len(contacts)} contacts")

    # ── Create Leads ─────────────────────────────────────────────────
    leads = []
    for i, l in enumerate(LEADS):
        lead = Lead(
            **l,
            owner_id=admin_user.id,
            created_at=now - timedelta(days=10 + i)
        )
        db.add(lead)
        leads.append(lead)
    db.flush()
    print(f"✅ Created {len(leads)} leads")

    # ── Create Deals ─────────────────────────────────────────────────
    deals = []
    for i, (title, value) in enumerate(DEAL_TEMPLATES):
        deal = Deal(
            title=title,
            value=value + random.randint(-2000, 5000),
            stage=STAGES[i % len(STAGES)],
            contact_id=contacts[i % len(contacts)].id,
            account_id=contacts[i % len(contacts)].account_id,
            owner_id=admin_user.id,
            created_at=now - timedelta(days=60 - i * 3),
            updated_at=now - timedelta(days=max(0, 20 - i * 2)),
        )
        db.add(deal)
        deals.append(deal)

    print(f"✅ Created {len(deals)} deals")

    # ── Create Activities ────────────────────────────────────────────
    # Mix of activities for contacts, deals, leads, accounts
    activities = []
    for i, (atype, subject, desc) in enumerate(ACTIVITY_TEMPLATES):
        # 1. Contact activity
        activities.append(Activity(
            type=atype, subject=f"C: {subject}", description=desc,
            contact_id=contacts[i % len(contacts)].id,
            date=now - timedelta(days=random.randint(1, 30))
        ))
        # 2. Deal activity
        activities.append(Activity(
            type=atype, subject=f"D: {subject}", description=desc,
            deal_id=deals[i % len(deals)].id,
            date=now - timedelta(days=random.randint(1, 30))
        ))
        # 3. Lead activity
        activities.append(Activity(
            type=atype, subject=f"L: {subject}", description=desc,
            lead_id=leads[i % len(leads)].id,
            date=now - timedelta(days=random.randint(1, 30))
        ))
        # 4. Account activity
        activities.append(Activity(
            type=atype, subject=f"A: {subject}", description=desc,
            account_id=accounts[i % len(accounts)].id,
            date=now - timedelta(days=random.randint(1, 30))
        ))

    for a in activities:
        db.add(a)

    print(f"✅ Created {len(activities)} mixed activities")

    db.commit()
    db.close()
    print("\n🎉 Seed complete!")


if __name__ == "__main__":
    seed()
