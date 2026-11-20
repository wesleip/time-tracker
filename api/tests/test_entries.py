def setup_project(client, headers):
    return client.post("/api/projects/", json={"name": "P", "color": "#22c55e"}, headers=headers).json()["id"]


def test_create_entry(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    response = client.post("/api/entries/", json={
        "project_id": project_id,
        "hours": 2.5,
        "date": "2026-06-05T12:00:00",
        "description": "Work done",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["hours"] == 2.5
    assert data["project_id"] == project_id


def test_create_entry_invalid_hours_returns_422(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    response = client.post("/api/entries/", json={
        "project_id": project_id,
        "hours": 25,
        "date": "2026-06-05T12:00:00",
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_entry_for_another_users_project_returns_404(client):
    client.post("/api/auth/register", json={"email": "a@x.com", "name": "A", "password": "pass123"})
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})

    token_a = client.post("/api/auth/login", json={"email": "a@x.com", "password": "pass123"}).json()["access_token"]
    token_b = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    project_id = client.post("/api/projects/", json={"name": "P", "color": "#22c55e"}, headers=headers_a).json()["id"]

    response = client.post("/api/entries/", json={
        "project_id": project_id,
        "hours": 1.0,
        "date": "2026-06-05T12:00:00",
    }, headers=headers_b)
    assert response.status_code == 404


def test_list_entries_by_date(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    client.post("/api/entries/", json={
        "project_id": project_id, "hours": 1.0, "date": "2026-06-05T12:00:00",
    }, headers=auth_headers)
    client.post("/api/entries/", json={
        "project_id": project_id, "hours": 2.0, "date": "2026-06-06T12:00:00",
    }, headers=auth_headers)

    response = client.get("/api/entries/?date=2026-06-05", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_list_entries_pagination(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    for i in range(3):
        client.post("/api/entries/", json={
            "project_id": project_id, "hours": 1.0, "date": f"2026-06-0{i + 1}T12:00:00",
        }, headers=auth_headers)

    page = client.get("/api/entries/", params={"limit": 2}, headers=auth_headers)
    assert page.status_code == 200
    assert len(page.json()) == 2
    assert page.headers["X-Total-Count"] == "3"

    rest = client.get("/api/entries/", params={"limit": 2, "offset": 2}, headers=auth_headers)
    assert len(rest.json()) == 1
    assert rest.headers["X-Total-Count"] == "3"


def test_list_entries_without_limit_returns_all(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    for i in range(3):
        client.post("/api/entries/", json={
            "project_id": project_id, "hours": 1.0, "date": f"2026-06-0{i + 1}T12:00:00",
        }, headers=auth_headers)

    response = client.get("/api/entries/", headers=auth_headers)
    assert len(response.json()) == 3
    assert response.headers["X-Total-Count"] == "3"


def test_list_entries_rejects_invalid_pagination(client, auth_headers):
    assert client.get("/api/entries/", params={"limit": 0}, headers=auth_headers).status_code == 422
    assert client.get("/api/entries/", params={"limit": 500}, headers=auth_headers).status_code == 422


def test_delete_entry(client, auth_headers):
    project_id = setup_project(client, auth_headers)
    entry_id = client.post("/api/entries/", json={
        "project_id": project_id, "hours": 1.0, "date": "2026-06-05T12:00:00",
    }, headers=auth_headers).json()["id"]

    response = client.delete(f"/api/entries/{entry_id}", headers=auth_headers)
    assert response.status_code == 204
