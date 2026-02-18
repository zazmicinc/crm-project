"""Unit tests for the Deals API endpoints."""


class TestCreateDeal:
    def test_create_deal_success(self, client, sample_contact, admin_headers):
        data = {
            "title": "Starter Plan",
            "value": 5000.0,
            "stage": "qualification",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data, headers=admin_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["title"] == "Starter Plan"
        assert body["value"] == 5000.0

    def test_create_deal_invalid_contact(self, client, admin_headers):
        data = {
            "title": "Ghost Deal",
            "value": 100.0,
            "stage": "prospecting",
            "contact_id": 9999,
        }
        response = client.post("/api/deals/", json=data, headers=admin_headers)
        assert response.status_code == 404
        assert "contact not found" in response.json()["detail"].lower()

    def test_create_deal_invalid_stage(self, client, sample_contact, admin_headers):
        data = {
            "title": "Bad Stage",
            "value": 100.0,
            "stage": "invalid_stage",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data, headers=admin_headers)
        assert response.status_code == 422

    def test_create_deal_negative_value(self, client, sample_contact, admin_headers):
        data = {
            "title": "Negative",
            "value": -500.0,
            "stage": "prospecting",
            "contact_id": sample_contact["id"],
        }
        response = client.post("/api/deals/", json=data, headers=admin_headers)
        assert response.status_code == 422


class TestListDeals:
    def test_list_empty(self, client, admin_headers):
        response = client.get("/api/deals/", headers=admin_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_deals(self, client, sample_deal, admin_headers):
        response = client.get("/api/deals/", headers=admin_headers)
        assert len(response.json()) == 1

    def test_filter_by_stage(self, client, sample_deal, admin_headers):
        response = client.get("/api/deals/", params={"stage": "prospecting"}, headers=admin_headers)
        assert len(response.json()) == 1
        response = client.get("/api/deals/", params={"stage": "closed_won"}, headers=admin_headers)
        assert len(response.json()) == 0

    def test_filter_by_contact(self, client, sample_deal, sample_contact, admin_headers):
        response = client.get("/api/deals/", params={"contact_id": sample_contact["id"]}, headers=admin_headers)
        assert len(response.json()) == 1
        response = client.get("/api/deals/", params={"contact_id": 9999}, headers=admin_headers)
        assert len(response.json()) == 0


class TestGetDeal:
    def test_get_existing(self, client, sample_deal, admin_headers):
        response = client.get(f"/api/deals/{sample_deal['id']}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["title"] == sample_deal["title"]

    def test_get_nonexistent(self, client, admin_headers):
        response = client.get("/api/deals/9999", headers=admin_headers)
        assert response.status_code == 404


class TestUpdateDeal:
    def test_update_stage(self, client, sample_deal, admin_headers):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"stage": "closed_won"},
            headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json()["stage"] == "closed_won"

    def test_update_value(self, client, sample_deal, admin_headers):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"value": 25000.0},
            headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json()["value"] == 25000.0

    def test_update_invalid_contact(self, client, sample_deal, admin_headers):
        response = client.put(
            f"/api/deals/{sample_deal['id']}",
            json={"contact_id": 9999},
            headers=admin_headers
        )
        assert response.status_code == 404

    def test_update_nonexistent(self, client, admin_headers):
        response = client.put("/api/deals/9999", json={"title": "Ghost"}, headers=admin_headers)
        assert response.status_code == 404


class TestDeleteDeal:
    def test_delete_success(self, client, sample_deal, admin_headers):
        response = client.delete(f"/api/deals/{sample_deal['id']}", headers=admin_headers)
        assert response.status_code == 204
        assert client.get(f"/api/deals/{sample_deal['id']}", headers=admin_headers).status_code == 404

    def test_delete_nonexistent(self, client, admin_headers):
        response = client.delete("/api/deals/9999", headers=admin_headers)
        assert response.status_code == 404
