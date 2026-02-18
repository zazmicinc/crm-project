from fastapi.testclient import TestClient
from app.main import app

def test_create_lead(client, admin_headers):
    response = client.post(
        "/api/leads/",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone": "+1-555-0100",
            "company": "Acme Corp",
            "source": "Website"
        },
        headers=admin_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["status"] == "New"
    assert "id" in data

def test_duplicate_lead(client, admin_headers):
    # Create first lead
    client.post(
        "/api/leads/",
        json={
            "first_name": "Original",
            "last_name": "Lead",
            "email": "dup@example.com",
            "company": "Dup Inc"
        },
        headers=admin_headers
    )
    
    # Try creating duplicate email
    response = client.post(
        "/api/leads/",
        json={
            "first_name": "Copy",
            "last_name": "Cat",
            "email": "dup@example.com",
            "company": "Other Co"
        },
        headers=admin_headers
    )
    assert response.status_code == 409
    data = response.json()
    assert data["duplicate"] is True
    assert "id" in data

def test_list_leads(client, admin_headers):
    client.post(
        "/api/leads/",
        json={
            "first_name": "L1",
            "last_name": "Last",
            "email": "l1@x.com"
        },
        headers=admin_headers
    )
    response = client.get("/api/leads/", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_update_lead(client, admin_headers):
    res = client.post(
        "/api/leads/",
        json={
            "first_name": "ToUpdate",
            "last_name": "User",
            "email": "update@x.com"
        },
        headers=admin_headers
    )
    lead_id = res.json()["id"]
    
    response = client.put(
        f"/api/leads/{lead_id}",
        json={"status": "Contacted"},
        headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Contacted"

def test_delete_lead(client, admin_headers):
    res = client.post(
        "/api/leads/",
        json={
            "first_name": "ToDelete",
            "last_name": "User",
            "email": "delete@x.com"
        },
        headers=admin_headers
    )
    lead_id = res.json()["id"]
    
    response = client.delete(f"/api/leads/{lead_id}", headers=admin_headers)
    assert response.status_code == 204
    
    get_res = client.get(f"/api/leads/{lead_id}", headers=admin_headers)
    assert get_res.status_code == 404

def test_convert_lead(client, admin_headers):
    # Create lead
    res = client.post(
        "/api/leads/",
        json={
            "first_name": "Convert",
            "last_name": "Me",
            "email": "convert@x.com",
            "company": "Big Co",
            "phone": "555-9999"
        },
        headers=admin_headers
    )
    lead_id = res.json()["id"]
    
    # Convert
    response = client.post(f"/api/leads/{lead_id}/convert", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "success"
    assert data["lead_id"] == lead_id
    assert data["account_id"] is not None
    assert data["contact_id"] is not None
    assert data["deal_id"] is not None
    
    # Verify Lead status updated
    lead_res = client.get(f"/api/leads/{lead_id}", headers=admin_headers)
    lead = lead_res.json()
    assert lead["status"] == "Converted"
    assert lead["converted_at"] is not None
    assert lead["converted_to_account_id"] == data["account_id"]
    
    # Verify Contact created
    contact_res = client.get(f"/api/contacts/{data['contact_id']}", headers=admin_headers)
    assert contact_res.status_code == 200
    assert contact_res.json()["email"] == "convert@x.com"
    
    # Verify Account created
    account_res = client.get(f"/api/accounts/{data['account_id']}", headers=admin_headers)
    assert account_res.status_code == 200
    assert account_res.json()["name"] == "Big Co"
    
    # Verify Deal created
    deal_res = client.get(f"/api/deals/{data['deal_id']}", headers=admin_headers)
    assert deal_res.status_code == 200
    assert "Big Co Deal" in deal_res.json()["title"]

def test_convert_lead_with_overrides(client, admin_headers):
    # Create lead
    res = client.post(
        "/api/leads/",
        json={
            "first_name": "Override",
            "last_name": "Test",
            "email": "override@x.com",
            "company": "Orig Co"
        },
        headers=admin_headers
    )
    lead_id = res.json()["id"]
    
    # Convert with overrides
    payload = {
        "contact": {"name": "Custom Contact Name", "email": "override@x.com"},
        "account": {"name": "Custom Account Name"},
        "deal": {"title": "Custom Deal Title", "value": 5000.0, "stage": "negotiation"}
    }
    response = client.post(f"/api/leads/{lead_id}/convert", json=payload, headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    
    # Verify Account override
    account_res = client.get(f"/api/accounts/{data['account_id']}", headers=admin_headers)
    assert account_res.json()["name"] == "Custom Account Name"
    
    # Verify Contact override
    contact_res = client.get(f"/api/contacts/{data['contact_id']}", headers=admin_headers)
    assert contact_res.json()["name"] == "Custom Contact Name"
    
    # Verify Deal override
    deal_res = client.get(f"/api/deals/{data['deal_id']}", headers=admin_headers)
    assert deal_res.json()["title"] == "Custom Deal Title"
    assert deal_res.json()["value"] == 5000.0
    assert deal_res.json()["stage"] == "negotiation"
