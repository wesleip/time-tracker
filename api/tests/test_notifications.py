def create_notification(client, headers, **overrides):
    payload = {"title": "Lembrete", "type": "system"}
    payload.update(overrides)
    return client.post("/api/notifications/", json=payload, headers=headers)


def second_user_headers(client):
    client.post("/api/auth/register", json={"email": "b@x.com", "name": "B", "password": "pass123"})
    token = client.post("/api/auth/login", json={"email": "b@x.com", "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_and_list_notification(client, auth_headers):
    response = create_notification(client, auth_headers, message="Tarefa atrasada")
    assert response.status_code == 201
    data = response.json()
    assert data["is_read"] is False
    assert data["type"] == "system"

    listed = client.get("/api/notifications/", headers=auth_headers).json()
    assert [n["id"] for n in listed] == [data["id"]]


def test_unread_count_and_mark_as_read(client, auth_headers):
    notification_id = create_notification(client, auth_headers).json()["id"]

    assert client.get("/api/notifications/unread-count", headers=auth_headers).json() == {"count": 1}

    marked = client.patch(f"/api/notifications/{notification_id}/read", headers=auth_headers)
    assert marked.status_code == 200
    assert marked.json()["is_read"] is True
    assert client.get("/api/notifications/unread-count", headers=auth_headers).json() == {"count": 0}


def test_unread_only_filter_and_read_all(client, auth_headers):
    create_notification(client, auth_headers, title="Lida")
    unread_id = create_notification(client, auth_headers, title="Não lida").json()["id"]

    read_ids = [
        n["id"]
        for n in client.get("/api/notifications/", headers=auth_headers).json()
        if n["title"] == "Lida"
    ]
    client.patch(f"/api/notifications/{read_ids[0]}/read", headers=auth_headers)

    unread = client.get("/api/notifications/", params={"unread_only": True}, headers=auth_headers).json()
    assert [n["id"] for n in unread] == [unread_id]

    assert client.patch("/api/notifications/read-all", headers=auth_headers).status_code == 204
    assert client.get("/api/notifications/unread-count", headers=auth_headers).json() == {"count": 0}


def test_delete_notification(client, auth_headers):
    notification_id = create_notification(client, auth_headers).json()["id"]

    assert client.delete(f"/api/notifications/{notification_id}", headers=auth_headers).status_code == 204
    assert client.get("/api/notifications/", headers=auth_headers).json() == []


def test_notifications_isolated_between_users(client, auth_headers):
    notification_id = create_notification(client, auth_headers).json()["id"]
    headers_b = second_user_headers(client)

    assert client.get("/api/notifications/", headers=headers_b).json() == []
    assert client.patch(f"/api/notifications/{notification_id}/read", headers=headers_b).status_code == 404
    assert client.delete(f"/api/notifications/{notification_id}", headers=headers_b).status_code == 404
    assert client.get("/api/notifications/unread-count", headers=headers_b).json() == {"count": 0}
