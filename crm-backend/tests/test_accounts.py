from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_account():
    response = client.post(
        "/api/accounts/",
        json={"name": "Test Account", "industry": "Tech", "email": "test@example.com"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Account"
    assert "id" in data

def test_read_account():
    # Create
    client.post(
        "/api/accounts/",
        json={"name": "Read Me", "industry": "Finance"}
    )
    # List
    response = client.get("/api/accounts/")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) > 0
    account_id = accounts[0]["id"]

    # Get One
    response = client.get(f"/api/accounts/{account_id}")
    assert response.status_code == 200
    assert response.json()["id"] == account_id

def test_update_account():
    create_res = client.post(
        "/api/accounts/",
        json={"name": "Old Name", "industry": "Tech"}
    )
    account_id = create_res.json()["id"]

    response = client.put(
        f"/api/accounts/{account_id}",
        json={"name": "New Name"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"

def test_delete_account():
    create_res = client.post(
        "/api/accounts/",
        json={"name": "Delete Me", "industry": "Tech"}
    )
    account_id = create_res.json()["id"]

    response = client.delete(f"/api/accounts/{account_id}")
    assert response.status_code == 204

    response = client.get(f"/api/accounts/{account_id}")
    assert response.status_code == 404

def test_account_relationships():
    # Create Account
    acc_res = client.post(
        "/api/accounts/",
        json={"name": "Rel Account", "industry": "Tech"}
    )
    account_id = acc_res.json()["id"]

    # Create Contact linked to Account
    contact_res = client.post(
        "/api/contacts/",
        json={
            "name": "Contact 1",
            "email": "c1@example.com",
            "account_id": account_id
        }
    )
    assert contact_res.status_code == 201
    
    # Create Deal linked to Account
    # Note: Deal needs contact_id as well
    contact_id = contact_res.json()["id"]
    deal_res = client.post(
        "/api/deals/",
        json={
            "title": "Big Deal",
            "value": 1000.0,
            "contact_id": contact_id,
            "account_id": account_id
        }
    )
    assert deal_res.status_code == 201

    # Verify Account -> Contacts
    response = client.get(f"/api/accounts/{account_id}/contacts")
    assert response.status_code == 200
    contacts = response.json()
    assert len(contacts) == 1
    assert contacts[0]["id"] == contact_id
    # Check account_name in contact response
    assert contacts[0]["account_name"] == "Rel Account"

    # Verify Account -> Deals
    response = client.get(f"/api/accounts/{account_id}/deals")
    assert response.status_code == 200
    deals = response.json()
    assert len(deals) == 1
    assert deals[0]["title"] == "Big Deal"
    # Check account_name in deal response
    assert deals[0]["account_name"] == "Rel Account"
