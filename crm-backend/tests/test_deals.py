"""Unit tests for the Deals API endpoints."""


class TestCreateDeal:
    def test_create_deal_success(self, client, sample_contact):
        data = {
            "title": "Starter Plan",
            "value": 5000.0,
            "stage": "qualification",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data)
        assert response.status_code == 201
        body = response.json()
        assert body["title"] == "Starter Plan"
        assert body["value"] == 5000.0
        assert body["stage"] == "qualification"

    def test_create_deal_invalid_contact(self, client):
        data = {
            "title": "Ghost Deal",
            "value": 100.0,
            "stage": "prospecting",
            "contact_id": 9999,
        }
        response = client.post("/api/deals/", json=data)
        assert response.status_code == 404
        assert "contact not found" in response.json()["detail"].lower()

    def test_create_deal_invalid_stage(self, client, sample_contact):
        data = {
            "title": "Bad Stage",
            "value": 100.0,
            "stage": "invalid_stage",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data)
        assert response.status_code == 422

    def test_create_deal_negative_value(self, client, sample_contact):
        data = {
            "title": "Negative",
            "value": -500.0,
            "stage": "prospecting",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data)
        assert response.status_code == 422


class TestListDeals:
    def test_list_empty(self, client):
        response = client.get("/api/deals/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_deals(self, client, sample_deal):
        response = client.get("/api/deals/")
        assert len(response.json()) == 1

    def test_filter_by_stage(self, client, sample_deal):
        response = client.get("/api/deals/", params={"stage": "prospecting"})
        assert len(response.json()) == 1
        response = client.get("/api/deals/", params={"stage": "closed_won"})
        assert len(response.json()) == 0

    def test_filter_by_contact(self, client, sample_deal, sample_contact):
        response = client.get("/api/deals/", params={"contact_id": sample_contact["id"]})
        assert len(response.json()) == 1
        response = client.get("/api/deals/", params={"contact_id": 9999})
        assert len(response.json()) == 0


class TestGetDeal:
    def test_get_existing(self, client, sample_deal):
        response = client.get(f"/api/deals/{sample_deal['id']}")
        assert response.status_code == 200
        assert response.json()["title"] == sample_deal["title"]

    def test_get_nonexistent(self, client):
        response = client.get("/api/deals/9999")
        assert response.status_code == 404


class TestUpdateDeal:
    def test_update_stage(self, client, sample_deal):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"stage": "closed_won"},
        )
        assert response.status_code == 200
        assert response.json()["stage"] == "closed_won"

    def test_update_value(self, client, sample_deal):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"value": 25000.0},
        )
        assert response.status_code == 200
        assert response.json()["value"] == 25000.0

    def test_update_invalid_contact(self, client, sample_deal):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"contact_id": 9999},
        )
        assert response.status_code == 404

    def test_update_nonexistent(self, client):
        response = client.put("/api/deals/9999", json={"title": "Ghost"})
        assert response.status_code == 404


class TestDeleteDeal:
    def test_delete_success(self, client, sample_deal):
        response = client.delete(f"/api/deals/{sample_deal['id']}")
        assert response.status_code == 204
        assert client.get(f"/api/deals/{sample_deal['id']}").status_code == 404

    def test_delete_nonexistent(self, client):
        response = client.delete("/api/deals/9999")
        assert response.status_code == 404
