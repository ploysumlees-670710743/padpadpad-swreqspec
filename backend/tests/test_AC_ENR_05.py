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

TEST_SECRET = "test-enrollment-application-session-secret"


def _session_cookie(user_id: str) -> str:
    payload = base64.b64encode(json.dumps({"user_id": user_id}).encode("utf-8"))
    return TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8")


def _client_for(connection: _ApplicationConnection, user_id: str | None) -> TestClient:
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_ApplicationConnection]:
        yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    client = TestClient(app)
    if user_id is not None:
        client.cookies.set("session", _session_cookie(user_id))
    return client


def test_AC_ENR_05_saved_application_status_is_visible(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: The signed-in applicant owns a successfully saved application for CAMP_ID.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _ApplicationConnection(
        applications=[
            (
                "application-001",
                "applicant-001",
                "camp-001",
                '{"full_name":"Applicant One","student_id":"1001"}',
                "submitted",
                "2026-11-08T18:00:00Z",
            )
        ]
    )

    # When: The owner requests the saved application.
    response = _client_for(connection, "applicant-001").get(
        "/applications/application-001"
    )

    # Then: The stored application data is returned.
    assert response.status_code == 200
    assert response.json()["application_id"] == "application-001"
    assert response.json()["camp_id"] == "camp-001"
    assert response.json()["form_data"] == {
        "full_name": "Applicant One",
        "student_id": "1001",
    }
    # Then: The saved status is submitted for display as “รอตรวจสอบ”.
    assert response.json()["status"] == "submitted"
    # Then: The lookup is scoped to the session owner and server-configured camp.
    assert connection.query_parameters == (
        "application-001",
        "applicant-001",
        "camp-001",
    )


def test_application_read_is_not_available_to_another_owner(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: An application exists for another signed-in applicant.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _ApplicationConnection(
        applications=[
            (
                "application-001",
                "applicant-001",
                "camp-001",
                '{"full_name":"Applicant One"}',
                "submitted",
                "2026-11-08T18:00:00Z",
            )
        ]
    )

    # When: A different owner requests that application.
    response = _client_for(connection, "applicant-002").get(
        "/applications/application-001"
    )

    # Then: The API does not expose the application data to the other owner.
    assert response.status_code == 404
    assert response.json() == {"detail": "Application not found."}
    assert connection.query_parameters == (
        "application-001",
        "applicant-002",
        "camp-001",
    )


def test_application_read_requires_a_session(monkeypatch: pytest.MonkeyPatch) -> None:
    # Given: An application exists but the requester has no Session.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _ApplicationConnection(
        applications=[
            (
                "application-001",
                "applicant-001",
                "camp-001",
                '{"full_name":"Applicant One"}',
                "submitted",
                "2026-11-08T18:00:00Z",
            )
        ]
    )

    # When: The requester calls the application endpoint without a Session.
    response = _client_for(connection, None).get("/applications/application-001")

    # Then: The API rejects the request without querying application data.
    assert response.status_code == 401
    assert connection.query_parameters is None


class _ApplicationConnection:
    def __init__(self, applications: list[tuple[Any, ...]]) -> None:
        self.applications = applications
        self.query_parameters: tuple[str, str, str] | None = None

    def cursor(self) -> _ApplicationCursor:
        return _ApplicationCursor(self)


class _ApplicationCursor:
    def __init__(self, connection: _ApplicationConnection) -> None:
        self.connection = connection
        self.row: tuple[Any, ...] | None = None

    def __enter__(self) -> _ApplicationCursor:
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(
        self,
        query: str,
        parameters: tuple[str, str, str],
    ) -> None:
        self.connection.query_parameters = parameters
        self.row = next(
            (
                (application_id, camp_id, form_data, status, submitted_at)
                for (
                    application_id,
                    applicant_id,
                    camp_id,
                    form_data,
                    status,
                    submitted_at,
                ) in self.connection.applications
                if parameters == (application_id, applicant_id, camp_id)
            ),
            None,
        )

    def fetchone(self) -> tuple[Any, ...] | None:
        return self.row
