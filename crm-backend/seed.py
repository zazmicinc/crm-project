from app.database import SessionLocal
from app.models import User, Lead, Contact, Account, Deal, Activity, Pipeline, Stage
from app.auth import get_password_hash
from datetime import datetime, timedelta
import random

db = SessionLocal()

print("Clearing existing data...")
db.query(Activity).delete()
db.query(Deal).delete()
db.query(Contact).delete()
db.query(Lead).delete()
db.query(Account).delete()
db.query(Stage).delete()
db.query(Pipeline).delete()
db.query(User).delete()
db.commit()

print("Creating users...")
admin = User(email="admin@crm.com", full_name="Admin User", hashed_password=get_password_hash("admin123"), is_active=True, role="admin")
sarah = User(email="sarah@crm.com", full_name="Sarah Chen", hashed_password=get_password_hash("admin123"), is_active=True, role="sales")
mike = User(email="mike@crm.com", full_name="Mike Torres", hashed_password=get_password_hash("admin123"), is_active=True, role="sales")
db.add_all([admin, sarah, mike])
db.commit()

print("Creating pipeline...")
pipeline = Pipeline(name="Default Pipeline", description="Main sales pipeline")
db.add(pipeline)
db.commit()
stages = [
    Stage(name="Prospecting", order=1, pipeline_id=pipeline.id, probability=10),
    Stage(name="Qualification", order=2, pipeline_id=pipeline.id, probability=25),
    Stage(name="Proposal", order=3, pipeline_id=pipeline.id, probability=50),
    Stage(name="Negotiation", order=4, pipeline_id=pipeline.id, probability=75),
    Stage(name="Closed Won", order=5, pipeline_id=pipeline.id, probability=100),
    Stage(name="Closed Lost", order=6, pipeline_id=pipeline.id, probability=0),
]
db.add_all(stages)
db.commit()

print("Creating accounts...")
accounts_data = [
    ("Stark Industries", "Technology", "stark.com", "Enterprise", 5000, "(310)555-0400"),
    ("Wayne Enterprises", "Conglomerate", "wayne.com", "Enterprise", 12000, "(212)555-0600"),
    ("Initech", "Software", "initech.com", "Mid-Market", 800, "(650)555-0300"),
    ("Globex Intl", "Manufacturing", "globex.com", "Mid-Market", 2200, "(415)555-0200"),
    ("Acme Corp", "Technology", "acme.com", "SMB", 150, "(415)555-0100"),
    ("Umbrella Corp", "Biotech", "umbrella.com", "Enterprise", 8000, "(312)555-0700"),
    ("Hooli", "Technology", "hooli.com", "Enterprise", 3500, "(408)555-0800"),
    ("Pied Piper", "Software", "piedpiper.com", "SMB", 45, "(650)555-0900"),
]
accounts = []
for name, industry, website, type_, employees, phone in accounts_data:
    a = Account(name=name, industry=industry, website=website, type=type_, employees=employees, phone=phone, status="prospect", owner_id=random.choice([admin.id, sarah.id, mike.id]))
    db.add(a)
    accounts.append(a)
db.commit()

print("Creating leads...")
leads_data = [
    ("Ryan","O'Brien","robrien@tech.com","Boston Analytics","VP Sales","Cold Call","New"),
    ("Tom","Anderson","tom@austin.com","Austin Digital","CEO","Referral","Qualified"),
    ("Priya","Sharma","priya@valley.com","Valley Innovations","CTO","Trade Show","Contacted"),
    ("Maria","Garcia","maria@socal.com","SoCal Media","Director","LinkedIn","Contacted"),
    ("James","Wilson","james@pnw.com","PNW Tech","Product Manager","Website","New"),
    ("Chen","Wei","cwei@startupco.com","StartupCo","Founder","Referral","Qualified"),
    ("Amanda","Lee","amanda@bigcorp.com","BigCorp","VP Marketing","Cold Email","New"),
    ("David","Kim","dkim@techfirm.com","TechFirm","Engineer","Website","Contacted"),
    ("Fatima","Al-Hassan","fatima@fhconsulting.com","FH Consulting","Partner","LinkedIn","Qualified"),
    ("Marcus","Johnson","mjohnson@retail.com","Retail Plus","COO","Trade Show","New"),
    ("Sofia","Rossi","srossi@eurotech.com","EuroTech","Director","Cold Call","Contacted"),
    ("Alex","Turner","aturner@media.com","Media Group","CMO","Referral","New"),
]
for first, last, email, company, title, source, status in leads_data:
    l = Lead(first_name=first, last_name=last, email=email, company=company, job_title=title, source=source, status=status, score=random.randint(10, 90), owner_id=random.choice([admin.id, sarah.id, mike.id]), created_at=datetime.now() - timedelta(days=random.randint(1, 60)))
    db.add(l)
db.commit()

print("Creating contacts...")
contacts_data = [
    ("Frank","Patel","fpatel@stark.com","(310)555-1001",accounts[0]),
    ("Grace","Lee","glee@wayne.com","(212)555-1002",accounts[1]),
    ("Henry","Brooks","hbrooks@initech.com","(650)555-1003",accounts[2]),
    ("David","Kim","dkim@globex.com","(415)555-1004",accounts[3]),
    ("Eva","Nguyen","anguyen@acme.com","(415)555-1005",accounts[4]),
    ("Carol","Davis","cdavis@umbrella.com","(312)555-1006",accounts[5]),
    ("Bob","Martinez","bmartinez@hooli.com","(408)555-1007",accounts[6]),
    ("Alice","Wong","awong@piedpiper.com","(650)555-1008",accounts[7]),
    ("Jordan","Smith","jsmith@stark.com","(310)555-1009",accounts[0]),
    ("Taylor","Brown","tbrown@wayne.com","(212)555-1010",accounts[1]),
]
contacts = []
for first, last, email, phone, account in contacts_data:
    c = Contact(first_name=first, last_name=last, email=email, phone=phone, account_id=account.id, status="active", owner_id=random.choice([admin.id, sarah.id, mike.id]), created_at=datetime.now() - timedelta(days=random.randint(1, 90)))
    db.add(c)
    contacts.append(c)
db.commit()

print("Creating deals...")
stage_map = {s.name: s for s in stages}
deals_data = [
    ("Stark Platform License", 350000, "Negotiation", "negotiation", accounts[0]),
    ("Wayne Enterprise Suite", 500000, "Proposal", "proposal", accounts[1]),
    ("Initech CRM Rollout", 45000, "Qualification", "qualification", accounts[2]),
    ("Globex Data Migration", 80000, "Prospecting", "prospecting", accounts[3]),
    ("Acme Starter Pack", 12000, "Closed Won", "closed_won", accounts[4]),
    ("Umbrella Analytics", 220000, "Negotiation", "negotiation", accounts[5]),
    ("Hooli Integration", 175000, "Proposal", "proposal", accounts[6]),
    ("Pied Piper Pro", 8500, "Qualification", "qualification", accounts[7]),
    ("Stark Mobile App", 95000, "Prospecting", "prospecting", accounts[0]),
    ("Wayne Security Module", 135000, "Closed Won", "closed_won", accounts[1]),
    ("Initech Dev Tools", 28000, "Closed Lost", "closed_lost", accounts[2]),
    ("Globex Pilot", 15000, "Closed Lost", "closed_lost", accounts[3]),
]
for title, value, stage_name, stage_enum, account in deals_data:
    stage_obj = stage_map.get(stage_name)
    d = Deal(title=title, value=value, stage=stage_enum, pipeline_id=pipeline.id, stage_id=stage_obj.id if stage_obj else stages[0].id, account_id=account.id, owner_id=random.choice([admin.id, sarah.id, mike.id]), close_date=datetime.now().date() + timedelta(days=random.randint(7, 90)), created_at=datetime.now() - timedelta(days=random.randint(1, 45)))
    db.add(d)
db.commit()

print("Creating activities...")
for i in range(40):
    a = Activity(type=random.choice(["call","email","meeting","note"]), notes=f"Activity note {i+1}", date=datetime.now() - timedelta(days=random.randint(0, 14)), owner_id=random.choice([admin.id, sarah.id, mike.id]))
    db.add(a)
db.commit()

print("Done! Seeded: 3 users, 8 accounts, 12 leads, 10 contacts, 12 deals, 40 activities")
db.close()
