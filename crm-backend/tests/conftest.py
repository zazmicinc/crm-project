"""Shared test fixtures: in-memory SQLite database and FastAPI test client."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

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
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def client():
    """Provide a TestClient instance."""
    return TestClient(app)


@pytest.fixture()
def sample_contact(client):
    """Create and return a sample contact."""
    data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1-555-0100",
        "company": "Acme Corp",
        "notes": "Key decision maker",
    }
    response = client.post("/api/contacts/", json=data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def sample_deal(client, sample_contact):
    """Create and return a sample deal linked to the sample contact."""
    data = {
        "title": "Enterprise Plan",
        "value": 15000.0,
        "stage": "prospecting",
        "contact_id": sample_contact["id"],
    }
    response = client.post("/api/deals/", json=data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def sample_activity(client, sample_contact):
    """Create and return a sample activity linked to the sample contact."""
    data = {
        "type": "call",
        "subject": "Intro call",
        "description": "Discussed project scope",
        "contact_id": sample_contact["id"],
    }
    response = client.post("/api/activities/", json=data)
    assert response.status_code == 201
    return response.json()
