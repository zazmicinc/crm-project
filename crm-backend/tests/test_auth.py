import pytest


def test_login_success(client):
    # admin@crm.com / admin123 is seeded by the conftest fixture
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@crm.com", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@crm.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_get_me(client):
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


def test_unauthorized_access(client):
    # Contacts list should be protected
    response = client.get("/api/contacts/")
    assert response.status_code == 401


def test_viewer_permission_restriction(client, admin_headers):
    # Get Role IDs
    roles_res = client.get("/api/roles/", headers=admin_headers)
    roles = roles_res.json()
    viewer_role = next(r for r in roles if r["name"] == "Viewer")

    # Create Viewer User
    client.post(
        "/api/users/",
        json={
            "email": "viewer@crm.com",
            "first_name": "View",
            "last_name": "Only",
            "password": "viewerpassword",
            "role_id": viewer_role["id"]
        },
        headers=admin_headers
    )

    # Login as Viewer
    viewer_login = client.post("/api/auth/login", data={"username": "viewer@crm.com", "password": "viewerpassword"})
    viewer_token = viewer_login.json()["access_token"]
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # Try to create contact (should fail)
    response = client.post(
        "/api/contacts/",
        json={"name": "Restricted", "email": "restricted@test.com"},
        headers=viewer_headers
    )
    assert response.status_code == 403

    # Try to read contacts (should succeed)
    response = client.get("/api/contacts/", headers=viewer_headers)
    assert response.status_code == 200
