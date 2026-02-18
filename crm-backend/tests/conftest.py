"""Shared test fixtures: in-memory SQLite database and FastAPI test client."""

import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Role, User
from app.auth import get_password_hash

# In-memory SQLite for fast, isolated testing
TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables and seed roles before each test."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    
    # Seed default roles
    db = TestingSessionLocal()
    roles = [
        Role(name="Admin", permissions=["*"]),
        Role(name="Sales Rep", permissions=[
            "contacts.read", "contacts.create", "contacts.update",
            "deals.read", "deals.create", "deals.update", "deals.move",
            "leads.read", "leads.create", "leads.update", "leads.convert",
            "accounts.read", "accounts.create", "accounts.update",
            "activities.read", "activities.create", "activities.update",
            "notes.read", "notes.create", "notes.update"
        ]),
        Role(name="Viewer", permissions=[
            "contacts.read", "deals.read", "leads.read", "accounts.read", 
            "activities.read", "notes.read"
        ])
    ]
    db.add_all(roles)
    
    # Create default admin
    admin_role = next(r for r in roles if r.name == "Admin")
    admin_user = User(
        email="admin@crm.com",
        first_name="Admin",
        last_name="User",
        password_hash=get_password_hash("admin123"),
        role=admin_role # Use relationship instead of ID
    )
    db.add(admin_user)
    db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def client():
    """Provide a TestClient instance."""
    return TestClient(app)


@pytest.fixture()
def admin_token(client):
    """Return a valid admin JWT token."""
    res = client.post("/api/auth/login", data={"username": "admin@crm.com", "password": "admin123"})
    return res.json()["access_token"]


@pytest.fixture()
def admin_headers(admin_token):
    """Return auth headers for admin user."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def sample_contact(client, admin_headers):
    """Create and return a sample contact."""
    data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1-555-0100",
        "company": "Acme Corp",
        "notes": "Key decision maker",
    }
    response = client.post("/api/contacts/", json=data, headers=admin_headers)
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def sample_deal(client, sample_contact, admin_headers):
    """Create and return a sample deal linked to the sample contact."""
    data = {
        "title": "Enterprise Plan",
        "value": 15000.0,
        "stage": "prospecting",
        "contact_id": sample_contact["id"],
    }
    response = client.post("/api/deals/", json=data, headers=admin_headers)
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def sample_activity(client, sample_contact, admin_headers):
    """Create and return a sample activity linked to the sample contact."""
    data = {
        "type": "call",
        "subject": "Intro call",
        "description": "Discussed project scope",
        "contact_id": sample_contact["id"],
    }
    response = client.post("/api/activities/", json=data, headers=admin_headers)
    assert response.status_code == 201
    return response.json()
