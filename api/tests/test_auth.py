def test_register_returns_token(client):
    response = client.post("/api/auth/register", json={
        "email": "user@example.com",
        "name": "User",
        "password": "secret123",
    })
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_register_duplicate_email_returns_409(client):
    payload = {"email": "dup@example.com", "name": "A", "password": "secret123"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


def test_register_short_password_returns_422(client):
    response = client.post("/api/auth/register", json={
        "email": "x@example.com",
        "name": "X",
        "password": "abc",
    })
    assert response.status_code == 422


def test_login_returns_token(client):
    client.post("/api/auth/register", json={
        "email": "u@example.com", "name": "U", "password": "pass123"
    })
    response = client.post("/api/auth/login", json={
        "email": "u@example.com", "password": "pass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_returns_401(client):
    client.post("/api/auth/register", json={
        "email": "u@example.com", "name": "U", "password": "pass123"
    })
    response = client.post("/api/auth/login", json={
        "email": "u@example.com", "password": "wrong"
    })
    assert response.status_code == 401


def test_me_returns_user(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


def test_me_without_token_returns_401(client):
    response = client.get("/api/auth/me")
    assert response.status_code in (401, 403)  # HTTPBearer raises 403; some versions raise 401
