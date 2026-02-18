"""Unit tests for the Activities API endpoints."""


class TestCreateActivity:
    def test_create_activity_success(self, client, sample_contact, admin_headers):
        data = {
            "type": "email",
            "subject": "Welcome email",
            "description": "Sent onboarding materials",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data, headers=admin_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["subject"] == "Welcome email"
        assert body["type"] == "email"

    def test_create_activity_with_date(self, client, sample_contact, admin_headers):
        data = {
            "type": "meeting",
            "subject": "Quarterly review",
            "date": "2026-03-01T14:00:00",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data, headers=admin_headers)
        assert response.status_code == 201
        assert response.json()["date"].startswith("2026-03-01")

    def test_create_activity_invalid_contact(self, client, admin_headers):
        data = {
            "type": "call",
            "subject": "Ghost call",
            "contact_id": 9999,
        }
        response = client.post("/api/activities/", json=data, headers=admin_headers)
        assert response.status_code == 404
        assert "contact not found" in response.json()["detail"].lower()

    def test_create_activity_invalid_type(self, client, sample_contact, admin_headers):
        data = {
            "type": "fax",
            "subject": "Old school",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/activities/", json=data, headers=admin_headers)
        assert response.status_code == 422


class TestListActivities:
    def test_list_empty(self, client, admin_headers):
        response = client.get("/api/activities/", headers=admin_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_activities(self, client, sample_activity, admin_headers):
        response = client.get("/api/activities/", headers=admin_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_filter_by_contact(self, client, sample_activity, sample_contact, admin_headers):
        response = client.get(
            "/api/activities/", params={"contact_id": sample_contact["id"]},
            headers=admin_headers
        )
        assert len(response.json()) == 1

        response = client.get("/api/activities/", params={"contact_id": 9999}, headers=admin_headers)
        assert len(response.json()) == 0


class TestGetActivity:
    def test_get_existing(self, client, sample_activity, admin_headers):
        response = client.get(f"/api/activities/{sample_activity['id']}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["subject"] == sample_activity["subject"]

    def test_get_nonexistent(self, client, admin_headers):
        response = client.get("/api/activities/9999", headers=admin_headers)
        assert response.status_code == 404


class TestUpdateActivity:
    def test_update_subject(self, client, sample_activity, admin_headers):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"subject": "Updated subject"},
            headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json()["subject"] == "Updated subject"

    def test_update_type(self, client, sample_activity, admin_headers):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"type": "meeting"},
            headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json()["type"] == "meeting"

    def test_update_invalid_contact(self, client, sample_activity, admin_headers):
        response = client.put(
            f"/api/activities/{sample_activity['id']}",
            json={"contact_id": 9999},
            headers=admin_headers
        )
        assert response.status_code == 404

    def test_update_nonexistent(self, client, admin_headers):
        response = client.put("/api/activities/9999", json={"subject": "Ghost"}, headers=admin_headers)
        assert response.status_code == 404


class TestDeleteActivity:
    def test_delete_success(self, client, sample_activity, admin_headers):
        response = client.delete(f"/api/activities/{sample_activity['id']}", headers=admin_headers)
        assert response.status_code == 204
        assert client.get(f"/api/activities/{sample_activity['id']}", headers=admin_headers).status_code == 404

    def test_delete_nonexistent(self, client, admin_headers):
        response = client.delete("/api/activities/9999", headers=admin_headers)
        assert response.status_code == 404
