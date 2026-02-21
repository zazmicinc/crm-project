import pytest
from app.models import User
from tests.conftest import TestingSessionLocal
from app.auth import get_password_hash

def test_oauth_login_redirect(client):
    """Test that the Google login endpoint returns a valid auth URL."""
    response = client.get("/api/auth/google/login")
    assert response.status_code == 200
    data = response.json()
    assert "auth_url" in data
    assert "state" in data
    assert data["auth_url"].startswith("https://accounts.google.com/o/oauth2/v2/auth")
    assert f"state={data['state']}" in data["auth_url"]

def test_unsupported_provider_login(client):
    """Test that unsupported providers return 400."""
    response = client.get("/api/auth/facebook/login")
    assert response.status_code == 400

def test_oauth_callback_new_user(client):
    """Test OAuth callback for a new user using the mock code bypass."""
    # The bypass uses code="mock-code" and state="mock-state"
    response = client.get("/api/auth/google/callback?code=mock-code&state=mock-state")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"
    
    # Verify DB state
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None
    assert user.auth_provider == "google"
    assert user.provider_id == "mock-google-id"
    assert user.password_hash is None

def test_oauth_callback_existing_user(client):
    """Test OAuth callback implicitly linking to an existing user by email."""
    # Pre-create the user with a password
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        first_name="Existing",
        last_name="User",
        password_hash=get_password_hash("secret"),
        role_id=1,
        auth_provider="local"
    )
    db.add(user)
    db.commit()
    db.close()
    
    # Run the callback flow
    response = client.get("/api/auth/google/callback?code=mock-code&state=mock-state")
    assert response.status_code == 200
    
    # Verify DB state - should not have created a new user, but updated existing one
    db = TestingSessionLocal()
    users = db.query(User).filter(User.email == "test@example.com").all()
    assert len(users) == 1
    updated_user = users[0]
    assert updated_user.auth_provider == "google"
    assert updated_user.provider_id == "mock-google-id"
    assert updated_user.password_hash is not None # Original password hash is retained

def test_oauth_callback_invalid_state(client):
    """Test OAuth callback handles invalid state."""
    response = client.get("/api/auth/google/callback?code=mock-code&state=bad-state")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid state"
