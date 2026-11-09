import base64
import json

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from itsdangerous import TimestampSigner
from starlette.middleware.sessions import SessionMiddleware

from backend.app.middleware.auth import get_current_user_id
from backend.main import create_app

TEST_SECRET = "test-only-session-signing-secret"


def create_identity_test_app() -> FastAPI:
    """Build a test-only route to exercise the session dependency (CON-ENR-02, NFR-SEC-01)."""
    test_app = FastAPI()
    test_app.add_middleware(SessionMiddleware, secret_key=TEST_SECRET)

    @test_app.get("/identity")
    def identity(user_id: str = Depends(get_current_user_id)) -> dict[str, str]:
        return {"user_id": user_id}

    return test_app


def signed_session_cookie(user_id: str) -> str:
    payload = base64.b64encode(json.dumps({"user_id": user_id}).encode("utf-8"))
    return TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8")


def test_enrollment_session_guard_rejects_missing_or_forged_identity() -> None:
    client = TestClient(create_identity_test_app())

    response = client.get("/identity")
    assert response.status_code == 401

    response = client.get("/identity", headers={"X-User-Id": "hacker-999"})
    assert response.status_code == 401

    client.cookies.set("session", "forged-session-cookie")
    response = client.get("/identity", headers={"X-User-Id": "hacker-999"})
    assert response.status_code == 401


def test_enrollment_session_guard_ignores_impersonation_headers_and_parameters() -> None:
    client = TestClient(create_identity_test_app())
    client.cookies.set("session", signed_session_cookie("applicant-001"))

    response = client.get(
        "/identity",
        params={"applicant_id": "hacker-999"},
        headers={"X-User-Id": "hacker-999"},
    )

    assert response.status_code == 200
    assert response.json() == {"user_id": "applicant-001"}


def test_fastapi_startup_verifies_database_connection() -> None:
    database_initialized = False

    def initialize_database() -> None:
        nonlocal database_initialized
        database_initialized = True

    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=initialize_database,
    )
    with TestClient(app):
        assert database_initialized is True


def test_fastapi_startup_requires_configured_session_secret() -> None:
    app = create_app(database_initializer=lambda: None)
    with pytest.raises(RuntimeError, match="APP_SECRET must be configured"):
        with TestClient(app):
            pass


def test_postgresql_connection_uses_configured_database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    from backend.app.db import database

    connection = _FakeConnection()
    received_urls: list[str] = []

    def connect(database_url: str) -> _FakeConnection:
        received_urls.append(database_url)
        return connection

    monkeypatch.setattr(database, "DATABASE_URL", "postgresql://db.example/camp_enrollment")
    monkeypatch.setattr(database.psycopg, "connect", connect)

    database.ensure_database()

    assert received_urls == ["postgresql://db.example/camp_enrollment"]
    assert connection.executed_sql == ["SELECT 1"]


class _FakeConnection:
    def __init__(self) -> None:
        self.executed_sql: list[str] = []

    def __enter__(self) -> "_FakeConnection":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str) -> None:
        self.executed_sql.append(query)
