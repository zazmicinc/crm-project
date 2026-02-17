#!/usr/bin/env python3
"""Seed the CRM database with sample data.

Creates 20 contacts, 15 deals across all stages, and 30 activities.
Run AFTER migrations: `python seed.py`
"""

from datetime import datetime, timedelta, timezone
import random

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Contact, Deal, Activity

DATABASE_URL = "sqlite:///./crm.db"

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
    {"name": "Karen Patel", "email": "karen.patel@healthplus.com", "phone": "+1-555-0111", "company": "HealthPlus", "notes": "IT Director. Healthcare compliance needed."},
    {"name": "Leo Fernandez", "email": "leo.fernandez@datadrive.mx", "phone": "+52-55-0112", "company": "DataDrive", "notes": "Data architect. Mexico City."},
    {"name": "Mia Johansson", "email": "mia.johansson@nordicai.se", "phone": "+46-8-0113", "company": "NordicAI", "notes": "CEO. AI-focused company in Stockholm."},
    {"name": "Noah Wilson", "email": "noah.wilson@cloudnine.com", "phone": "+1-555-0114", "company": "CloudNine", "notes": "DevOps Lead. Needs scalability."},
    {"name": "Olivia Brown", "email": "olivia.brown@retailmax.co.uk", "phone": "+44-20-0115", "company": "RetailMax", "notes": "Buyer. London retail chain."},
    {"name": "Paul Rossi", "email": "paul.rossi@automate.it", "phone": "+39-02-0116", "company": "Automate.it", "notes": "Solutions Architect. Milan."},
    {"name": "Quinn Adams", "email": "quinn.adams@edulearn.com", "phone": "+1-555-0117", "company": "EduLearn", "notes": "VP of Product. EdTech sector."},
    {"name": "Rachel Green", "email": "rachel.green@stylehaus.com", "phone": "+1-555-0118", "company": "StyleHaus", "notes": "Creative Director. Fashion tech."},
    {"name": "Sam O'Brien", "email": "sam.obrien@finwatch.ie", "phone": "+353-1-0119", "company": "FinWatch", "notes": "Compliance Officer. Dublin."},
    {"name": "Tina Müller", "email": "tina.mueller@greenenergy.de", "phone": "+49-89-0120", "company": "GreenEnergy", "notes": "Sustainability Lead. Munich."},
]

STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]

DEAL_TEMPLATES = [
    ("Enterprise License", 50000), ("Professional Plan", 25000), ("Starter Package", 5000),
    ("Annual Subscription", 12000), ("Consulting Engagement", 30000), ("API Integration", 18000),
    ("Data Migration", 8000), ("Training Program", 6500), ("Custom Development", 45000),
    ("Support Contract", 15000), ("Platform Upgrade", 22000), ("Security Audit", 9500),
    ("Cloud Migration", 35000), ("Analytics Dashboard", 11000), ("Mobile App", 40000),
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
    ("email", "Feature update", "Shared latest product release notes"),
    ("meeting", "Quarterly review", "QBR with stakeholders"),
    ("call", "Onboarding call", "Walked through initial setup steps"),
    ("email", "Invoice sent", "Sent invoice for current billing period"),
    ("meeting", "Strategy session", "Discussed expansion opportunities"),
    ("call", "Support escalation", "Resolved critical issue via call"),
    ("email", "Survey request", "Sent NPS satisfaction survey"),
    ("meeting", "Renewal discussion", "Discussed upcoming contract renewal"),
    ("call", "Referral ask", "Asked for customer referrals"),
    ("email", "Thank you note", "Sent appreciation email after deal close"),
    ("meeting", "Kickoff meeting", "Project kickoff with full team"),
    ("call", "Pricing discussion", "Discussed volume discount options"),
    ("email", "Documentation shared", "Sent API documentation links"),
    ("meeting", "Executive briefing", "C-level overview presentation"),
    ("call", "Feedback collection", "Gathered product feedback"),
    ("email", "Renewal reminder", "Sent 30-day renewal reminder"),
    ("meeting", "Integration planning", "Planned integration milestones"),
    ("call", "Upsell discussion", "Presented upgrade options"),
    ("email", "Holiday greeting", "Sent seasonal greeting message"),
    ("meeting", "Year-end review", "Annual relationship review and planning"),
]


def seed():
    """Insert seed data into the database."""
    db = Session()

    # Check if data already exists
    if db.query(Contact).count() > 0:
        print("⚠️  Database already has data. Skipping seed.")
        db.close()
        return

    now = datetime.now(timezone.utc)

    # ── Create 20 contacts ───────────────────────────────────────────
    contacts = []
    for i, c in enumerate(CONTACTS):
        contact = Contact(
            **c,
            created_at=now - timedelta(days=90 - i * 4),
            updated_at=now - timedelta(days=max(0, 30 - i * 2)),
        )
        db.add(contact)
        contacts.append(contact)

    db.flush()  # Get IDs
    print(f"✅ Created {len(contacts)} contacts")

    # ── Create 15 deals ──────────────────────────────────────────────
    deals = []
    for i, (title, value) in enumerate(DEAL_TEMPLATES):
        deal = Deal(
            title=title,
            value=value + random.randint(-2000, 5000),
            stage=STAGES[i % len(STAGES)],
            contact_id=contacts[i % len(contacts)].id,
            created_at=now - timedelta(days=60 - i * 3),
            updated_at=now - timedelta(days=max(0, 20 - i * 2)),
        )
        db.add(deal)
        deals.append(deal)

    print(f"✅ Created {len(deals)} deals")

    # ── Create 30 activities ─────────────────────────────────────────
    activities = []
    for i, (atype, subject, desc) in enumerate(ACTIVITY_TEMPLATES):
        activity = Activity(
            type=atype,
            subject=subject,
            description=desc,
            contact_id=contacts[i % len(contacts)].id,
            date=now - timedelta(days=60 - i * 2, hours=random.randint(0, 12)),
            created_at=now - timedelta(days=60 - i * 2),
        )
        db.add(activity)
        activities.append(activity)

    print(f"✅ Created {len(activities)} activities")

    db.commit()
    db.close()
    print("\n🎉 Seed complete! Database is ready.")


if __name__ == "__main__":
    seed()
