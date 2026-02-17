"""Unit tests for the Activities API endpoints."""


class TestCreateActivity:
    def test_create_activity_success(self, client, sample_contact):
        data = {
            "type": "email",
            "subject": "Welcome email",
            "description": "Sent onboarding materials",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data)
        assert response.status_code == 201
        body = response.json()
        assert body["type"] == "email"
        assert body["subject"] == "Welcome email"
        assert "date" in body

    def test_create_activity_with_date(self, client, sample_contact):
        data = {
            "type": "meeting",
            "subject": "Quarterly review",
            "date": "2026-03-01T14:00:00",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data)
        assert response.status_code == 201
        assert "2026-03-01" in response.json()["date"]

    def test_create_activity_invalid_contact(self, client):
        data = {
            "type": "call",
            "subject": "Ghost call",
            "contact_id": 9999,
        }
        response = client.post("/api/activities/", json=data)
        assert response.status_code == 404

    def test_create_activity_invalid_type(self, client, sample_contact):
        data = {
            "type": "fax",
            "subject": "Old school",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data)
        assert response.status_code == 422


class TestListActivities:
    def test_list_empty(self, client):
        response = client.get("/api/activities/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_activities(self, client, sample_activity):
        response = client.get("/api/activities/")
        assert len(response.json()) == 1

    def test_filter_by_contact(self, client, sample_activity, sample_contact):
        response = client.get(
            "/api/activities/", params={"contact_id": sample_contact["id"]}
        )
        assert len(response.json()) == 1

        response = client.get("/api/activities/", params={"contact_id": 9999})
        assert len(response.json()) == 0


class TestGetActivity:
    def test_get_existing(self, client, sample_activity):
        response = client.get(f"/api/activities/{sample_activity['id']}")
        assert response.status_code == 200
        assert response.json()["subject"] == sample_activity["subject"]

    def test_get_nonexistent(self, client):
        response = client.get("/api/activities/9999")
        assert response.status_code == 404


class TestUpdateActivity:
    def test_update_subject(self, client, sample_activity):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"subject": "Updated subject"},
        )
        assert response.status_code == 200
        assert response.json()["subject"] == "Updated subject"

    def test_update_type(self, client, sample_activity):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"type": "meeting"},
        )
        assert response.status_code == 200
        assert response.json()["type"] == "meeting"

    def test_update_invalid_contact(self, client, sample_activity):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"contact_id": 9999},
        )
        assert response.status_code == 404

    def test_update_nonexistent(self, client):
        response = client.put("/api/activities/9999", json={"subject": "Ghost"})
        assert response.status_code == 404


class TestDeleteActivity:
    def test_delete_success(self, client, sample_activity):
        response = client.delete(f"/api/activities/{sample_activity['id']}")
        assert response.status_code == 204
        assert client.get(f"/api/activities/{sample_activity['id']}").status_code == 404

    def test_delete_nonexistent(self, client):
        response = client.delete("/api/activities/9999")
        assert response.status_code == 404
