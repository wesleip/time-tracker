def create_project(client, headers, name="Proj A", color="#3b82f6"):
    return client.post("/api/projects/", json={"name": name, "color": color}, headers=headers)


def test_list_projects_empty(client, auth_headers):
    response = client.get("/api/projects/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_create_project(client, auth_headers):
    response = create_project(client, auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Proj A"
    assert data["color"] == "#3b82f6"


def test_projects_isolated_between_users(client):
    client.post("/api/auth/register", json={"email": "a@x.com", "name": "A", "password": "pass123"})
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})

    token_a = client.post("/api/auth/login", json={"email": "a@x.com", "password": "pass123"}).json()["access_token"]
    token_b = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    create_project(client, headers_a, "Project of A")

    projects_b = client.get("/api/projects/", headers=headers_b).json()
    assert projects_b == []

    projects_a = client.get("/api/projects/", headers=headers_a).json()
    assert len(projects_a) == 1


def test_update_project(client, auth_headers):
    project_id = create_project(client, auth_headers).json()["id"]
    response = client.put(f"/api/projects/{project_id}", json={"name": "Updated"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


def test_delete_project(client, auth_headers):
    project_id = create_project(client, auth_headers).json()["id"]
    response = client.delete(f"/api/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = client.get(f"/api/projects/{project_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_get_another_users_project_returns_404(client):
    client.post("/api/auth/register", json={"email": "a@x.com", "name": "A", "password": "pass123"})
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})

    token_a = client.post("/api/auth/login", json={"email": "a@x.com", "password": "pass123"}).json()["access_token"]
    token_b = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    project_id = create_project(client, headers_a).json()["id"]

    response = client.get(f"/api/projects/{project_id}", headers=headers_b)
    assert response.status_code == 404
