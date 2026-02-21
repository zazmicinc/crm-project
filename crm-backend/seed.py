"""Seed script for CRM database."""
from datetime import datetime, timedelta, timezone
import bcrypt
from app.database import SessionLocal, engine, Base
from app.models import Role, User, Account, Contact, Deal, Activity, Lead, Pipeline, Stage



def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Role).count() > 0:
        print("Already seeded. Skipping.")
        db.close()
        return
    now = datetime.now(timezone.utc)

    r1 = Role(name="Admin", permissions=["*"])
    r2 = Role(name="Manager", permissions=["read","write","delete"])
    r3 = Role(name="Sales Rep", permissions=["read","write"])
    r4 = Role(name="Viewer", permissions=["read"])
    db.add_all([r1,r2,r3,r4]); db.flush()

    u1 = User(email="admin@crm.com",first_name="Admin",last_name="User",password_hash=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(),role_id=r1.id)
    u2 = User(email="sarah@crm.com",first_name="Sarah",last_name="Chen",password_hash=bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode(),role_id=r2.id)
    u3 = User(email="mike@crm.com",first_name="Mike",last_name="Johnson",password_hash=bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode(),role_id=r3.id)
    db.add_all([u1,u2,u3]); db.flush()

    a1 = Account(name="Acme Corp",industry="Technology",phone="(415)555-0100",email="info@acme.com",owner_id=u2.id)
    a2 = Account(name="Globex Intl",industry="Manufacturing",phone="(415)555-0200",email="info@globex.com",owner_id=u2.id)
    a3 = Account(name="Initech",industry="Software",phone="(650)555-0300",email="info@initech.io",owner_id=u3.id)
    a4 = Account(name="Stark Industries",industry="Defense",phone="(310)555-0400",email="info@stark.com",owner_id=u3.id)
    a5 = Account(name="Wayne Enterprises",industry="Conglomerate",phone="(212)555-0500",email="info@wayne.com",owner_id=u2.id)
    db.add_all([a1,a2,a3,a4,a5]); db.flush()

    c1 = Contact(name="Alice Wang",email="alice@acme.com",phone="(415)555-1001",company="Acme Corp",account_id=a1.id,owner_id=u2.id)
    c2 = Contact(name="Bob Martinez",email="bob@acme.com",phone="(415)555-1002",company="Acme Corp",account_id=a1.id,owner_id=u2.id)
    c3 = Contact(name="Carol Davis",email="carol@globex.com",phone="(415)555-2001",company="Globex Intl",account_id=a2.id,owner_id=u2.id)
    c4 = Contact(name="David Kim",email="david@initech.io",phone="(650)555-3001",company="Initech",account_id=a3.id,owner_id=u3.id)
    c5 = Contact(name="Eva Nguyen",email="eva@initech.io",phone="(650)555-3002",company="Initech",account_id=a3.id,owner_id=u3.id)
    c6 = Contact(name="Frank Patel",email="frank@stark.com",phone="(310)555-4001",company="Stark Industries",account_id=a4.id,owner_id=u3.id)
    c7 = Contact(name="Grace Lee",email="grace@wayne.com",phone="(212)555-5001",company="Wayne Enterprises",account_id=a5.id,owner_id=u2.id)
    c8 = Contact(name="Henry Brooks",email="henry@wayne.com",phone="(212)555-5002",company="Wayne Enterprises",account_id=a5.id,owner_id=u2.id)
    db.add_all([c1,c2,c3,c4,c5,c6,c7,c8]); db.flush()

    p = Pipeline(name="Default Pipeline",is_default=1)
    db.add(p); db.flush()
    s1=Stage(pipeline_id=p.id,name="Prospecting",order=1,probability=10)
    s2=Stage(pipeline_id=p.id,name="Qualification",order=2,probability=25)
    s3=Stage(pipeline_id=p.id,name="Proposal",order=3,probability=50)
    s4=Stage(pipeline_id=p.id,name="Negotiation",order=4,probability=75)
    s5=Stage(pipeline_id=p.id,name="Closed Won",order=5,probability=100)
    s6=Stage(pipeline_id=p.id,name="Closed Lost",order=6,probability=0)
    db.add_all([s1,s2,s3,s4,s5,s6]); db.flush()

    d1=Deal(title="Acme Platform License",value=75000,stage="proposal",contact_id=c1.id,account_id=a1.id,pipeline_id=p.id,stage_id=s3.id,owner_id=u2.id)
    d2=Deal(title="Acme Support Contract",value=25000,stage="negotiation",contact_id=c2.id,account_id=a1.id,pipeline_id=p.id,stage_id=s4.id,owner_id=u2.id)
    d3=Deal(title="Globex ERP Integration",value=120000,stage="qualification",contact_id=c3.id,account_id=a2.id,pipeline_id=p.id,stage_id=s2.id,owner_id=u2.id)
    d4=Deal(title="Initech Dev Tools",value=45000,stage="proposal",contact_id=c4.id,account_id=a3.id,pipeline_id=p.id,stage_id=s3.id,owner_id=u3.id)
    d5=Deal(title="Initech Analytics",value=60000,stage="prospecting",contact_id=c5.id,account_id=a3.id,pipeline_id=p.id,stage_id=s1.id,owner_id=u3.id)
    d6=Deal(title="Stark CRM Migration",value=200000,stage="negotiation",contact_id=c6.id,account_id=a4.id,pipeline_id=p.id,stage_id=s4.id,owner_id=u3.id)
    d7=Deal(title="Wayne Enterprise License",value=350000,stage="qualification",contact_id=c7.id,account_id=a5.id,pipeline_id=p.id,stage_id=s2.id,owner_id=u2.id)
    d8=Deal(title="Acme Data Migration",value=40000,stage="closed_won",contact_id=c1.id,account_id=a1.id,pipeline_id=p.id,stage_id=s5.id,owner_id=u2.id)
    d9=Deal(title="Globex Pilot",value=15000,stage="closed_lost",contact_id=c3.id,account_id=a2.id,pipeline_id=p.id,stage_id=s6.id,owner_id=u2.id)
    db.add_all([d1,d2,d3,d4,d5,d6,d7,d8,d9]); db.flush()

    l1=Lead(first_name="James",last_name="Wilson",email="james@outlook.com",company="PNW Tech",status="New",source="Website",owner_id=u3.id)
    l2=Lead(first_name="Maria",last_name="Garcia",email="maria@gmail.com",company="SoCal Media",status="Contacted",source="LinkedIn",owner_id=u2.id)
    l3=Lead(first_name="Tom",last_name="Anderson",email="tom@yahoo.com",company="Austin Digital",status="Qualified",source="Referral",owner_id=u3.id)
    l4=Lead(first_name="Priya",last_name="Sharma",email="priya@company.com",company="Valley Innovations",status="New",source="Trade Show",owner_id=u2.id)
    l5=Lead(first_name="Ryan",last_name="OBrien",email="robrien@tech.com",company="Boston Analytics",status="Contacted",source="Cold Call",owner_id=u3.id)
    db.add_all([l1,l2,l3,l4,l5]); db.flush()

    acts=[
        Activity(type="call",subject="Discovery call with Alice",date=now-timedelta(days=1),contact_id=c1.id,deal_id=d1.id),
        Activity(type="call",subject="Follow-up with Carol",date=now-timedelta(days=2),contact_id=c3.id,deal_id=d3.id),
        Activity(type="call",subject="Pricing with Frank",date=now-timedelta(days=3),contact_id=c6.id,deal_id=d6.id),
        Activity(type="email",subject="Proposal sent to Alice",date=now-timedelta(days=1),contact_id=c1.id,deal_id=d1.id),
        Activity(type="email",subject="Contract draft to Bob",date=now-timedelta(days=2),contact_id=c2.id,deal_id=d2.id),
        Activity(type="email",subject="Follow-up with David",date=now-timedelta(days=3),contact_id=c4.id,deal_id=d4.id),
        Activity(type="email",subject="Case study to Grace",date=now-timedelta(days=5),contact_id=c7.id,deal_id=d7.id),
        Activity(type="meeting",subject="Demo with Initech",date=now-timedelta(days=1),contact_id=c5.id,deal_id=d5.id),
        Activity(type="meeting",subject="QBR with Acme",date=now-timedelta(days=4),contact_id=c1.id,account_id=a1.id),
        Activity(type="meeting",subject="Negotiation with Stark",date=now-timedelta(days=5),contact_id=c6.id,deal_id=d6.id),
        Activity(type="call",subject="Check-in with Eva",date=now-timedelta(hours=6),contact_id=c5.id,deal_id=d5.id),
        Activity(type="email",subject="Updated proposal to Carol",date=now-timedelta(hours=12),contact_id=c3.id,deal_id=d3.id),
    ]
    db.add_all(acts)
    db.commit()
    db.close()
    print("Seeded: 4 roles, 3 users, 5 accounts, 8 contacts, 9 deals, 5 leads, 12 activities")
    print("Login: admin@crm.com / admin123")

if __name__ == "__main__":
    seed()
