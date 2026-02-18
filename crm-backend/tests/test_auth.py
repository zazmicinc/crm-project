from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_login_success():
    # admin@crm.com / admin123 was seeded
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@crm.com", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@crm.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_me():
    # Login first
    login_res = client.post(
        "/api/auth/login",
        data={"username": "admin@crm.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "admin@crm.com"

def test_unauthorized_access():
    # Contacts list should now be protected
    response = client.get("/api/contacts/")
    assert response.status_code == 401

def test_viewer_permission_restriction():
    # 1. Login as admin to create a viewer
    login_res = client.post("/api/auth/login", data={"username": "admin@crm.com", "password": "admin123"})
    admin_token = login_res.json()["access_token"]
    
    # Get Role IDs
    roles_res = client.get("/api/roles/", headers={"Authorization": f"Bearer {admin_token}"})
    roles = roles_res.json()
    viewer_role = next(r for r in roles if r["name"] == "Viewer")
    
    # 2. Create Viewer User
    client.post(
        "/api/users/",
        json={
            "email": "viewer@crm.com",
            "first_name": "View",
            "last_name": "Only",
            "password": "viewerpassword",
            "role_id": viewer_role["id"]
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 3. Login as Viewer
    viewer_login = client.post("/api/auth/login", data={"username": "viewer@crm.com", "password": "viewerpassword"})
    viewer_token = viewer_login.json()["access_token"]
    
    # 4. Try to create contact (should fail)
    response = client.post(
        "/api/contacts/",
        json={"name": "Restricted", "email": "restricted@test.com"},
        headers={"Authorization": f"Bearer {viewer_token}"}
    )
    assert response.status_code == 403
    
    # 5. Try to read contacts (should succeed)
    response = client.get("/api/contacts/", headers={"Authorization": f"Bearer {viewer_token}"})
    assert response.status_code == 200
