from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_pipeline_helper():
    response = client.post(
        "/api/pipelines/",
        json={"name": "Sales Pipeline", "is_default": True}
    )
    assert response.status_code == 201
    return response.json()

def create_stages_helper(pipeline_id):
    stages = ["Discovery", "Proposal", "Negotiation", "Closed Won"]
    created_stages = []
    for i, name in enumerate(stages):
        response = client.post(
            f"/api/pipelines/{pipeline_id}/stages/",
            json={"name": name, "order": i, "probability": (i+1)*10}
        )
        assert response.status_code == 201
        created_stages.append(response.json())
    return created_stages

def test_create_pipeline():
    # Only test creation here
    data = create_pipeline_helper()
    assert data["name"] == "Sales Pipeline"
    assert data["is_default"] is True
    assert "id" in data

def test_create_stages():
    # Create a pipeline first
    pipeline = create_pipeline_helper()
    # Test creating stages
    stages = create_stages_helper(pipeline["id"])
    assert len(stages) == 4
    assert stages[0]["name"] == "Discovery"

def test_pipeline_and_stages_flow():
    # 1. Create Pipeline
    pipeline = create_pipeline_helper()
    p_id = pipeline["id"]
    
    # 2. Create Stages
    stages = create_stages_helper(p_id)
    first_stage_id = stages[0]["id"]
    second_stage_id = stages[1]["id"]
    
    # 3. Create Contact
    contact_res = client.post(
        "/api/contacts/",
        json={"name": "Pipeline User", "email": "pipe@x.com"}
    )
    contact_id = contact_res.json()["id"]
    
    # 4. Create Deal (should auto-assign default pipeline/stage)
    deal_res = client.post(
        "/api/deals/",
        json={
            "title": "Default Pipe Deal",
            "value": 1000.0,
            "contact_id": contact_id
        }
    )
    assert deal_res.status_code == 201
    deal = deal_res.json()
    assert deal["pipeline_id"] == p_id
    assert deal["stage_id"] == first_stage_id
    
    # 5. Move Deal
    move_res = client.post(
        f"/api/deals/{deal['id']}/move",
        json={"stage_id": second_stage_id}
    )
    assert move_res.status_code == 200
    
    # 6. Verify Move & History
    deal_get = client.get(f"/api/deals/{deal['id']}")
    assert deal_get.json()["stage_id"] == second_stage_id
    
    history_res = client.get(f"/api/deals/{deal['id']}/stage-history")
    history = history_res.json()
    assert len(history) == 1
    assert history[0]["from_stage_id"] == first_stage_id
    assert history[0]["to_stage_id"] == second_stage_id

def test_reorder_stages():
    pipeline = create_pipeline_helper()
    p_id = pipeline["id"]
    stages = create_stages_helper(p_id)
    s1, s2, s3, s4 = [s["id"] for s in stages]
    
    # Reverse order
    new_order = [s4, s3, s2, s1]
    
    res = client.put(
        f"/api/pipelines/{p_id}/stages/reorder",
        json={"stage_ids": new_order}
    )
    assert res.status_code == 204
    
    # Verify order
    list_res = client.get(f"/api/pipelines/{p_id}/stages/")
    reordered = list_res.json()
    # API returns ordered by order ASC. So first item in list should match first ID in our reorder logic?
    # Wait, reorder updates 'order' field.
    # If we set s4 to order 0, s3 to order 1...
    # Then listing by order ASC should return s4 first.
    assert reordered[0]["id"] == s4
    assert reordered[3]["id"] == s1
