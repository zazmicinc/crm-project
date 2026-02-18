from fastapi.testclient import TestClient
from app.main import app

def test_create_note(client, admin_headers):
    response = client.post(
        "/api/notes/",
        json={
            "content": "Meeting notes",
            "related_to_type": "contact",
            "related_to_id": 1
        },
        headers=admin_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Meeting notes"
    assert "id" in data

def test_list_notes(client, admin_headers):
    # Create two notes
    client.post("/api/notes/", json={"content": "N1", "related_to_type": "contact", "related_to_id": 1}, headers=admin_headers)
    client.post("/api/notes/", json={"content": "N2", "related_to_type": "deal", "related_to_id": 2}, headers=admin_headers)
    
    # List all
    response = client.get("/api/notes/", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 2
    
    # Filter
    response = client.get("/api/notes/", params={"related_to_type": "deal", "related_to_id": 2}, headers=admin_headers)
    notes = response.json()
    assert len(notes) == 1
    assert notes[0]["content"] == "N2"

def test_update_note(client, admin_headers):
    res = client.post("/api/notes/", json={"content": "Old", "related_to_type": "lead", "related_to_id": 1}, headers=admin_headers)
    note_id = res.json()["id"]
    
    response = client.put(f"/api/notes/{note_id}", json={"content": "New"}, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["content"] == "New"

def test_delete_note(client, admin_headers):
    res = client.post("/api/notes/", json={"content": "Del", "related_to_type": "lead", "related_to_id": 1}, headers=admin_headers)
    note_id = res.json()["id"]
    
    client.delete(f"/api/notes/{note_id}", headers=admin_headers)
    response = client.get(f"/api/notes/{note_id}", headers=admin_headers)
    assert response.status_code == 404
