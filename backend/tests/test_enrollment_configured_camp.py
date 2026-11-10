from __future__ import annotations

import base64
import json
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from itsdangerous import TimestampSigner

from backend.app.api.camp_enrollment import get_camp_connection
from backend.main import create_app

TEST_SECRET = "test-configured-camp-session-secret"


def _session_cookie(user_id: str) -> str:
    payload = base64.b64encode(json.dumps({"user_id": user_id}).encode("utf-8"))
    return TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8")


def _client_for(connection: _FakeConnection, user_id: str | None = None) -> TestClient:
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_FakeConnection]:
        yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    client = TestClient(app)
    if user_id is not None:
        client.cookies.set("session", _session_cookie(user_id))
    return client


def test_configured_camp_api_AC_ENR_01(monkeypatch: pytest.MonkeyPatch) -> None:
    """Given the configured camp is open and the applicant has a session, return that camp only."""
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _FakeConnection(
        camps=[
            (
                "camp-001",
                "Configured Camp",
                "open",
                "2026-11-01",
                "2026-11-30",
                '["full_name","student_id"]',
                '["student_id_card"]',
            ),
            (
                "camp-002",
                "Other Camp",
                "open",
                "2026-12-01",
                "2026-12-31",
                '["other_field"]',
                '["other_document"]',
            ),
        ]
    )

    with _client_for(connection, "applicant-001") as client:
        response = client.get("/enrollment/camp")

    assert response.status_code == 200
    assert response.json() == {
        "camp_id": "camp-001",
        "name": "Configured Camp",
        "status": "open",
        "open_date": "2026-11-01",
        "close_date": "2026-11-30",
        "required_fields": [
            "full_name",
            "nickname",
            "student_id",
            "year_level",
            "phone_number",
            "contact_channel",
            "food_allergy",
        ],
        "required_documents": [],
    }
    assert connection.executed_query is not None
    assert "WHERE camp_id = %s" in connection.executed_query
    assert connection.query_parameters == ("camp-001",)


def test_configured_camp_api_requires_session(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _FakeConnection(camps=[])

    with _client_for(connection) as client:
        response = client.get("/enrollment/camp")

    assert response.status_code == 401
    assert connection.executed_query is None


@pytest.mark.parametrize(
    ("camp_id", "camps"),
    [
        (None, [("camp-001", "Other Camp", "open", None, None, "[]", "[]")]),
        ("camp-missing", [("camp-001", "Other Camp", "open", None, None, "[]", "[]")]),
    ],
)
def test_configured_camp_api_reports_configuration_error_without_fallback(
    monkeypatch: pytest.MonkeyPatch,
    camp_id: str | None,
    camps: list[tuple[str, str, str, str | None, str | None, str, str]],
) -> None:
    if camp_id is None:
        monkeypatch.delenv("CAMP_ID", raising=False)
    else:
        monkeypatch.setenv("CAMP_ID", camp_id)
    connection = _FakeConnection(camps=camps)

    with _client_for(connection, "applicant-001") as client:
        response = client.get("/enrollment/camp")

    assert response.status_code == 500
    assert response.json() == {"detail": "Configuration Error"}
    if camp_id is None:
        assert connection.executed_query is None
    else:
        assert connection.query_parameters == (camp_id,)


class _FakeConnection:
    def __init__(self, camps: list[tuple[Any, ...]]) -> None:
        self.camps = camps
        self.executed_query: str | None = None
        self.query_parameters: tuple[str, ...] | None = None

    def cursor(self) -> "_FakeCursor":
        return _FakeCursor(self)


class _FakeCursor:
    def __init__(self, connection: _FakeConnection) -> None:
        self.connection = connection

    def __enter__(self) -> "_FakeCursor":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str, parameters: tuple[str, ...]) -> None:
        self.connection.executed_query = query
        self.connection.query_parameters = parameters

    def fetchone(self) -> tuple[Any, ...] | None:
        parameters = self.connection.query_parameters
        if parameters is None:
            raise AssertionError("A query must execute before fetching a configured camp.")
        camp_id = parameters[0]
        return next((camp for camp in self.connection.camps if camp[0] == camp_id), None)
