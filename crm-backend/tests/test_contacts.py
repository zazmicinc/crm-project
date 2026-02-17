"""Unit tests for the Contacts API endpoints."""


class TestCreateContact:
    def test_create_contact_success(self, client):
        data = {
            "name": "Alice Smith",
            "email": "alice@example.com",
            "phone": "+1-555-0101",
            "company": "TechCo",
            "notes": "New lead",
        }
        response = client.post("/api/contacts/", json=data)
        assert response.status_code == 201
        body = response.json()
        assert body["name"] == "Alice Smith"
        assert body["email"] == "alice@example.com"
        assert "id" in body
        assert "created_at" in body

    def test_create_contact_minimal(self, client):
        """Only name and email are required."""
        data = {"name": "Bob", "email": "bob@example.com"}
        response = client.post("/api/contacts/", json=data)
        assert response.status_code == 201
        assert response.json()["phone"] is None

    def test_create_contact_duplicate_email(self, client, sample_contact):
        data = {"name": "Duplicate", "email": sample_contact["email"]}
        response = client.post("/api/contacts/", json=data)
        assert response.status_code == 400
        assert "email already exists" in response.json()["detail"]

    def test_create_contact_invalid_email(self, client):
        data = {"name": "Bad Email", "email": "not-an-email"}
        response = client.post("/api/contacts/", json=data)
        assert response.status_code == 422

    def test_create_contact_missing_name(self, client):
        data = {"email": "noname@example.com"}
        response = client.post("/api/contacts/", json=data)
        assert response.status_code == 422


class TestListContacts:
    def test_list_empty(self, client):
        response = client.get("/api/contacts/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_contacts(self, client, sample_contact):
        response = client.get("/api/contacts/")
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_list_search_by_name(self, client, sample_contact):
        response = client.get("/api/contacts/", params={"search": "Jane"})
        assert len(response.json()) == 1

    def test_list_search_by_company(self, client, sample_contact):
        response = client.get("/api/contacts/", params={"search": "Acme"})
        assert len(response.json()) == 1

    def test_list_search_no_match(self, client, sample_contact):
        response = client.get("/api/contacts/", params={"search": "zzz"})
        assert len(response.json()) == 0

    def test_list_pagination(self, client):
        for i in range(5):
            client.post("/api/contacts/", json={"name": f"C{i}", "email": f"c{i}@x.com"})
        response = client.get("/api/contacts/", params={"skip": 2, "limit": 2})
        assert len(response.json()) == 2


class TestGetContact:
    def test_get_existing(self, client, sample_contact):
        response = client.get(f"/api/contacts/{sample_contact['id']}")
        assert response.status_code == 200
        assert response.json()["email"] == sample_contact["email"]

    def test_get_nonexistent(self, client):
        response = client.get("/api/contacts/9999")
        assert response.status_code == 404


class TestUpdateContact:
    def test_update_partial(self, client, sample_contact):
        response = client.put(
            f"/api/contacts/{sample_contact['id']}",
            json={"company": "NewCo"},
        )
        assert response.status_code == 200
        assert response.json()["company"] == "NewCo"
        assert response.json()["name"] == sample_contact["name"]  # unchanged

    def test_update_email_uniqueness(self, client, sample_contact):
        client.post("/api/contacts/", json={"name": "Other", "email": "other@x.com"})
        response = client.put(
            f"/api/contacts/{sample_contact['id']}",
            json={"email": "other@x.com"},
        )
        assert response.status_code == 400

    def test_update_nonexistent(self, client):
        response = client.put("/api/contacts/9999", json={"name": "Ghost"})
        assert response.status_code == 404


class TestDeleteContact:
    def test_delete_success(self, client, sample_contact):
        response = client.delete(f"/api/contacts/{sample_contact['id']}")
        assert response.status_code == 204
        assert client.get(f"/api/contacts/{sample_contact['id']}").status_code == 404

    def test_delete_nonexistent(self, client):
        response = client.delete("/api/contacts/9999")
        assert response.status_code == 404
