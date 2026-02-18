from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_contact_timeline():
    # 1. Create Contact
    contact_res = client.post("/api/contacts/", json={"name": "Timeline Contact", "email": "timeline@example.com"})
    contact_id = contact_res.json()["id"]

    # 2. Create Note linked to Contact
    client.post("/api/notes/", json={"content": "Contact Note", "related_to_type": "contact", "related_to_id": contact_id})

    # 3. Create Activity linked to Contact
    client.post("/api/activities/", json={"type": "call", "subject": "Call Contact", "contact_id": contact_id})

    # 4. Create Deal linked to Contact (implicitly creates pipeline/stage if needed, but lets rely on defaults or simple create)
    deal_res = client.post("/api/deals/", json={"title": "Contact Deal", "value": 1000, "contact_id": contact_id})
    deal_id = deal_res.json()["id"]

    # 5. Move Deal to generate StageChange (requires at least 2 stages, default pipeline has them?)
    # We need to know stage IDs.
    # Let's just assume listing deals works and we can fetch timeline.
    # To test stage change, we need to move it.
    # But for now, let's just check if Note and Activity appear.
    
    response = client.get(f"/api/contacts/{contact_id}/timeline")
    assert response.status_code == 200
    timeline = response.json()
    
    types = [t["type"] for t in timeline]
    assert "note" in types
    assert "activity" in types
    # Stage change might not be there if we didn't move it, but deal creation doesn't log stage change in my implementation yet?
    # Ah, in create_deal I don't create a StageChange record, only on move.
    
def test_deal_timeline():
    # 1. Create Contact
    contact_res = client.post("/api/contacts/", json={"name": "Deal Contact", "email": "deal_timeline@example.com"})
    contact_id = contact_res.json()["id"]

    # 2. Create Deal
    deal_res = client.post("/api/deals/", json={"title": "Timeline Deal", "value": 5000, "contact_id": contact_id})
    deal_id = deal_res.json()["id"]

    # 3. Create Note linked to Deal
    client.post("/api/notes/", json={"content": "Deal Note", "related_to_type": "deal", "related_to_id": deal_id})

    # 4. Create Activity linked to Deal
    client.post("/api/activities/", json={"type": "email", "subject": "Email Deal", "contact_id": contact_id, "deal_id": deal_id})

    # 5. Get Timeline
    response = client.get(f"/api/deals/{deal_id}/timeline")
    assert response.status_code == 200
    timeline = response.json()
    
    types = [t["type"] for t in timeline]
    assert "note" in types
    assert "activity" in types
