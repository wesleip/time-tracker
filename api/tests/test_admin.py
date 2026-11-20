from app.models import User


def test_admin_routes_reject_regular_user(client, auth_headers):
    assert client.get("/api/admin/overview", headers=auth_headers).status_code == 403


def test_admin_overview_counts(client, auth_headers, db):
    user = db.query(User).filter(User.email == "test@example.com").one()
    user.is_admin = True
    db.commit()

    client.post("/api/projects/", json={"name": "Proj"}, headers=auth_headers)
    client.post(
        "/api/entries/",
        json={"project_id": client.get("/api/projects/", headers=auth_headers).json()[0]["id"], "hours": 2, "date": "2026-08-01"},
        headers=auth_headers,
    )

    response = client.get("/api/admin/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] == 1
    assert data["total_projects"] == 1
    assert data["total_entries"] == 1
    assert data["total_hours"] == 2

    assert len(client.get("/api/admin/users", headers=auth_headers).json()) == 1
    assert len(client.get("/api/admin/projects", headers=auth_headers).json()) == 1
    assert len(client.get("/api/admin/timelogs", headers=auth_headers).json()) == 1
