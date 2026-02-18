from fastapi.testclient import TestClient
from app.main import app

def test_contact_timeline(client, admin_headers):
    # 1. Create Contact
    contact_res = client.post("/api/contacts/", json={"name": "Timeline Contact", "email": "timeline@example.com"}, headers=admin_headers)
    contact_id = contact_res.json()["id"]

    # 2. Create Note linked to Contact
    client.post("/api/notes/", json={"content": "Contact Note", "related_to_type": "contact", "related_to_id": contact_id}, headers=admin_headers)

    # 3. Create Activity linked to Contact
    client.post("/api/activities/", json={"type": "call", "subject": "Call Contact", "contact_id": contact_id}, headers=admin_headers)

    # 4. Get Timeline
    response = client.get(f"/api/contacts/{contact_id}/timeline", headers=admin_headers)
    assert response.status_code == 200
    timeline = response.json()
    
    types = [t["type"] for t in timeline]
    assert "note" in types
    assert "activity" in types
    
def test_deal_timeline(client, admin_headers):
    # 1. Create Contact
    contact_res = client.post("/api/contacts/", json={"name": "Deal Contact", "email": "deal_timeline@example.com"}, headers=admin_headers)
    contact_id = contact_res.json()["id"]

    # 2. Create Deal
    deal_res = client.post("/api/deals/", json={"title": "Timeline Deal", "value": 5000, "contact_id": contact_id}, headers=admin_headers)
    deal_id = deal_res.json()["id"]

    # 3. Create Note linked to Deal
    client.post("/api/notes/", json={"content": "Deal Note", "related_to_type": "deal", "related_to_id": deal_id}, headers=admin_headers)

    # 4. Create Activity linked to Deal
    client.post("/api/activities/", json={"type": "email", "subject": "Email Deal", "contact_id": contact_id, "deal_id": deal_id}, headers=admin_headers)

    # 5. Get Timeline
    response = client.get(f"/api/deals/{deal_id}/timeline", headers=admin_headers)
    assert response.status_code == 200
    timeline = response.json()
    
    types = [t["type"] for t in timeline]
    assert "note" in types
    assert "activity" in types
