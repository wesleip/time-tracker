from datetime import date, timedelta


def create_task(client, headers, **overrides):
    payload = {"title": "Tarefa A"}
    payload.update(overrides)
    return client.post("/api/tasks/", json=payload, headers=headers)


def second_user_headers(client):
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})
    token = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_task_uses_default_section(client, auth_headers):
    response = create_task(client, auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Tarefa A"
    assert data["status"] == "pending"
    assert data["priority"] == 3
    assert data["section_id"] is not None

    sections = client.get("/api/sections/", headers=auth_headers).json()
    assert any(s["id"] == data["section_id"] and s["name"] == "Geral" for s in sections)


def test_update_task(client, auth_headers):
    task_id = create_task(client, auth_headers).json()["id"]
    response = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Renomeada", "priority": 1, "due_date": "2026-08-01"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Renomeada"
    assert data["priority"] == 1
    assert data["due_date"] == "2026-08-01"


def test_toggle_task_twice(client, auth_headers):
    task_id = create_task(client, auth_headers).json()["id"]

    first = client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert first.status_code == 200
    assert first.json()["status"] == "completed"
    assert first.json()["completed_at"] is not None

    second = client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert second.json()["status"] == "pending"
    assert second.json()["completed_at"] is None


def test_complete_non_recurring_creates_no_child(client, auth_headers):
    task_id = create_task(client, auth_headers).json()["id"]

    response = client.patch(f"/api/tasks/{task_id}/complete", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

    assert len(client.get("/api/tasks/", headers=auth_headers).json()) == 1


def test_complete_recurring_creates_next_occurrence(client, auth_headers):
    due = date(2026, 8, 1)
    task_id = create_task(
        client, auth_headers, title="Daily", due_date=due.isoformat(), recurrence="daily"
    ).json()["id"]

    client.patch(f"/api/tasks/{task_id}/complete", headers=auth_headers)

    tasks = client.get("/api/tasks/", headers=auth_headers).json()
    assert len(tasks) == 2
    child = next(t for t in tasks if t["id"] != task_id)
    assert child["parent_id"] == task_id
    assert child["status"] == "pending"
    assert child["title"] == "Daily"
    assert child["recurrence"] == "daily"
    assert child["due_date"] == (due + timedelta(days=1)).isoformat()


def test_filters_status_section_and_search(client, auth_headers):
    section_id = client.post("/api/sections/", json={"name": "Trabalho"}, headers=auth_headers).json()["id"]
    done_id = create_task(client, auth_headers, title="Comprar café", section_id=section_id).json()["id"]
    create_task(client, auth_headers, title="Escrever relatório")
    client.patch(f"/api/tasks/{done_id}/toggle", headers=auth_headers)

    completed = client.get("/api/tasks/", params={"status": "completed"}, headers=auth_headers).json()
    assert [t["id"] for t in completed] == [done_id]

    by_section = client.get("/api/tasks/", params={"section_id": section_id}, headers=auth_headers).json()
    assert [t["id"] for t in by_section] == [done_id]

    by_search = client.get("/api/tasks/", params={"search": "relatório"}, headers=auth_headers).json()
    assert len(by_search) == 1
    assert by_search[0]["title"] == "Escrever relatório"


def test_filter_by_due_date_and_project(client, auth_headers):
    project_id = client.post("/api/projects/", json={"name": "Proj"}, headers=auth_headers).json()["id"]
    create_task(client, auth_headers, title="Hoje", due_date="2026-08-01", project_id=project_id)
    create_task(client, auth_headers, title="Outro dia", due_date="2026-08-02")

    by_date = client.get("/api/tasks/", params={"due_date": "2026-08-01"}, headers=auth_headers).json()
    assert [t["title"] for t in by_date] == ["Hoje"]

    by_project = client.get("/api/tasks/", params={"project_id": project_id}, headers=auth_headers).json()
    assert [t["title"] for t in by_project] == ["Hoje"]


def test_delete_task(client, auth_headers):
    task_id = create_task(client, auth_headers).json()["id"]

    assert client.delete(f"/api/tasks/{task_id}", headers=auth_headers).status_code == 204
    assert client.get(f"/api/tasks/{task_id}", headers=auth_headers).status_code == 404


def test_tasks_isolated_between_users(client, auth_headers):
    task_id = create_task(client, auth_headers).json()["id"]
    headers_b = second_user_headers(client)

    assert client.get("/api/tasks/", headers=headers_b).json() == []
    assert client.get(f"/api/tasks/{task_id}", headers=headers_b).status_code == 404
    assert client.put(f"/api/tasks/{task_id}", json={"title": "Hack"}, headers=headers_b).status_code == 404
    assert client.delete(f"/api/tasks/{task_id}", headers=headers_b).status_code == 404


def test_tasks_require_auth(client):
    assert client.get("/api/tasks/").status_code in (401, 403)
