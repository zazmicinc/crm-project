from fastapi.testclient import TestClient
from app.main import app

def test_create_account(client, admin_headers):
    response = client.post(
        "/api/accounts/",
        json={"name": "Test Account", "industry": "Tech", "email": "test@example.com"},
        headers=admin_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Account"
    assert "id" in data

def test_read_account(client, admin_headers):
    # Create
    client.post(
        "/api/accounts/",
        json={"name": "Read Me", "industry": "Finance"},
        headers=admin_headers
    )
    # List
    response = client.get("/api/accounts/", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_update_account(client, admin_headers):
    create_res = client.post(
        "/api/accounts/",
        json={"name": "Old Name", "industry": "Tech"},
        headers=admin_headers
    )
    account_id = create_res.json()["id"]
    
    response = client.put(
        f"/api/accounts/{account_id}",
        json={"name": "New Name"},
        headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"

def test_delete_account(client, admin_headers):
    create_res = client.post(
        "/api/accounts/",
        json={"name": "Delete Me", "industry": "Tech"},
        headers=admin_headers
    )
    account_id = create_res.json()["id"]
    
    response = client.delete(f"/api/accounts/{account_id}", headers=admin_headers)
    assert response.status_code == 204
    
    get_res = client.get(f"/api/accounts/{account_id}", headers=admin_headers)
    assert get_res.status_code == 404

def test_account_relationships(client, admin_headers):
    # Create Account
    acc_res = client.post(
        "/api/accounts/",
        json={"name": "Rel Account", "industry": "Tech"},
        headers=admin_headers
    )
    account_id = acc_res.json()["id"]
    
    # Create Contact linked to Account
    client.post(
        "/api/contacts/",
        json={"name": "Acc Contact", "email": "acc@test.com", "account_id": account_id},
        headers=admin_headers
    )
    
    # Get Account Contacts
    response = client.get(f"/api/accounts/{account_id}/contacts", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Acc Contact"
