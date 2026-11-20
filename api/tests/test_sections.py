def create_section(client, headers, name="Trabalho", color="#ff0000"):
    return client.post("/api/sections/", json={"name": name, "color": color}, headers=headers)


def second_user_headers(client):
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})
    token = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_sections_starts_empty(client, auth_headers):
    assert client.get("/api/sections/", headers=auth_headers).json() == []


def test_create_and_update_section(client, auth_headers):
    response = create_section(client, auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Trabalho"
    assert data["color"] == "#ff0000"
    assert data["order"] == 0

    updated = client.put(
        f"/api/sections/{data['id']}", json={"name": "Pessoal", "order": 2}, headers=auth_headers
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Pessoal"
    assert updated.json()["order"] == 2


def test_delete_section(client, auth_headers):
    section_id = create_section(client, auth_headers).json()["id"]

    assert client.delete(f"/api/sections/{section_id}", headers=auth_headers).status_code == 204
    assert client.delete(f"/api/sections/{section_id}", headers=auth_headers).status_code == 404


def test_deleting_section_cascades_to_its_tasks(client, auth_headers):
    """Documenta o comportamento atual: excluir seção apaga as tarefas (não move)."""
    section_id = create_section(client, auth_headers).json()["id"]
    task_id = client.post(
        "/api/tasks/", json={"title": "Dentro da seção", "section_id": section_id}, headers=auth_headers
    ).json()["id"]

    client.delete(f"/api/sections/{section_id}", headers=auth_headers)

    assert client.get(f"/api/tasks/{task_id}", headers=auth_headers).status_code == 404


def test_sections_isolated_between_users(client, auth_headers):
    section_id = create_section(client, auth_headers).json()["id"]
    headers_b = second_user_headers(client)

    assert client.get("/api/sections/", headers=headers_b).json() == []
    assert client.put(f"/api/sections/{section_id}", json={"name": "Hack"}, headers=headers_b).status_code == 404
    assert client.delete(f"/api/sections/{section_id}", headers=headers_b).status_code == 404
