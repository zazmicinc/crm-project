from fastapi.testclient import TestClient
from app.main import app

def create_pipeline_helper(client, admin_headers):
    response = client.post(
        "/api/pipelines/",
        json={"name": "Sales Pipeline", "is_default": True},
        headers=admin_headers
    )
    assert response.status_code == 201
    return response.json()

def test_create_pipeline(client, admin_headers):
    # Only test creation here
    data = create_pipeline_helper(client, admin_headers)
    assert data["name"] == "Sales Pipeline"
    assert data["is_default"] is True

def test_create_stages(client, admin_headers):
    # Create a pipeline first
    pipeline = create_pipeline_helper(client, admin_headers)
    
    response = client.post(
        f"/api/pipelines/{pipeline['id']}/stages/",
        json={"name": "Discovery", "order": 1, "probability": 10},
        headers=admin_headers
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Discovery"

def test_pipeline_and_stages_flow(client, admin_headers):
    # 1. Create Pipeline
    pipeline = create_pipeline_helper(client, admin_headers)
    p_id = pipeline["id"]

    # 2. Create Stages
    stages = ["Lead", "Meeting", "Closing"]
    for i, name in enumerate(stages):
        client.post(
            f"/api/pipelines/{p_id}/stages/",
            json={"name": name, "order": i, "probability": i*30},
            headers=admin_headers
        )

    # 3. List Stages
    response = client.get(f"/api/pipelines/{p_id}/stages/", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 3
    assert response.json()[0]["name"] == "Lead"

    # 4. Update Pipeline
    response = client.put(
        f"/api/pipelines/{p_id}",
        json={"name": "New Name"},
        headers=admin_headers
    )
    assert response.json()["name"] == "New Name"

    # 5. Update Stage
    stage_id = response.json() # Wait, this is wrong. List stages again
    stages_data = client.get(f"/api/pipelines/{p_id}/stages/", headers=admin_headers).json()
    s_id = stages_data[0]["id"]
    response = client.put(
        f"/api/pipelines/{p_id}/stages/{s_id}",
        json={"name": "Updated Stage"},
        headers=admin_headers
    )
    assert response.json()["name"] == "Updated Stage"

    # 6. Delete Stage
    client.delete(f"/api/pipelines/{p_id}/stages/{s_id}", headers=admin_headers)
    assert len(client.get(f"/api/pipelines/{p_id}/stages/", headers=admin_headers).json()) == 2

    # 7. Delete Pipeline
    client.delete(f"/api/pipelines/{p_id}", headers=admin_headers)
    assert client.get(f"/api/pipelines/{p_id}", headers=admin_headers).status_code == 404

def test_reorder_stages(client, admin_headers):
    pipeline = create_pipeline_helper(client, admin_headers)
    p_id = pipeline["id"]
    
    s1 = client.post(f"/api/pipelines/{p_id}/stages/", json={"name": "S1", "order": 0}, headers=admin_headers).json()
    s2 = client.post(f"/api/pipelines/{p_id}/stages/", json={"name": "S2", "order": 1}, headers=admin_headers).json()
    
    # Reorder
    client.put(
        f"/api/pipelines/{p_id}/stages/reorder",
        json={"stage_ids": [s2["id"], s1["id"]]},
        headers=admin_headers
    )
    
    stages = client.get(f"/api/pipelines/{p_id}/stages/", headers=admin_headers).json()
    assert stages[0]["id"] == s2["id"]
    assert stages[1]["id"] == s1["id"]
