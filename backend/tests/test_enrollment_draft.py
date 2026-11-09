from __future__ import annotations

import base64
import copy
import json
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi.testclient import TestClient
from itsdangerous import TimestampSigner

from backend.app.api.camp_enrollment import get_camp_connection
from backend.main import create_app

TEST_SECRET = "test-draft-session-secret"


@pytest.fixture(autouse=True)
def _configured_camp_id(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")


def _session_cookie(user_id: str) -> str:
    payload = base64.b64encode(json.dumps({"user_id": user_id}).encode("utf-8"))
    return TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8")


def _client_for(
    connection: _FakeConnection,
    user_id: str | None = None,
    *,
    raise_server_exceptions: bool = True,
) -> TestClient:
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_FakeConnection]:
        with connection:
            yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    client = TestClient(app, raise_server_exceptions=raise_server_exceptions)
    if user_id is not None:
        client.cookies.set("session", _session_cookie(user_id))
    return client


def test_draft_owner_save_load_AC_ENR_01() -> None:
    connection = _FakeConnection()
    owner_client = _client_for(connection, "applicant-001")
    other_client = _client_for(connection, "applicant-002")
    form_data = {
        "full_name": "ผู้สมัคร ตัวอย่าง",
        "nickname": "น้อง",
        "year_level": "2",
    }

    saved = owner_client.put("/applications/draft", json={"form_data": form_data})

    assert saved.status_code == 200
    assert saved.json()["form_data"] == form_data
    draft_id = saved.json()["draft_id"]
    loaded = owner_client.get("/applications/draft")
    assert loaded.status_code == 200
    assert loaded.json()["draft_id"] == draft_id
    assert loaded.json()["form_data"] == form_data
    assert "documents" not in loaded.json()
    assert other_client.get("/applications/draft").status_code == 404

    updated_data = {**form_data, "food_allergy": "no"}
    updated = owner_client.put(
        "/applications/draft",
        json={"form_data": updated_data},
    )
    assert updated.status_code == 200
    assert updated.json()["draft_id"] == draft_id
    assert owner_client.get("/applications/draft").json()["form_data"] == updated_data


def test_draft_save_does_not_create_submitted_application() -> None:
    connection = _FakeConnection()
    unrelated_application = ("another-applicant", "camp-001")
    connection.applications.add(unrelated_application)

    response = _client_for(
        connection,
        "applicant-001",
        raise_server_exceptions=False,
    ).put(
        "/applications/draft",
        json={"form_data": {"full_name": "ข้อมูลบางส่วน"}},
    )

    assert response.status_code == 200
    draft_key = ("applicant-001", "camp-001")
    assert draft_key in connection.drafts
    assert connection.drafts[draft_key]["form_data"] == {"full_name": "ข้อมูลบางส่วน"}
    assert draft_key not in connection.applications
    assert unrelated_application in connection.applications


def test_draft_owner_is_taken_from_session_not_request_data() -> None:
    connection = _FakeConnection()
    client = _client_for(connection, "session-owner")

    response = client.put(
        "/applications/draft",
        json={
            "applicant_id": "forged-owner",
            "camp_id": "forged-camp",
            "form_data": {"full_name": "ผู้สมัคร"},
        },
    )

    assert response.status_code == 200
    assert ("session-owner", "camp-001") in connection.drafts
    assert ("forged-owner", "camp-001") not in connection.drafts
    assert ("session-owner", "forged-camp") not in connection.drafts
    assert response.json()["camp_id"] == "camp-001"


def test_draft_endpoints_reject_missing_session() -> None:
    connection = _FakeConnection()
    client = _client_for(connection)

    assert client.get("/applications/draft").status_code == 401
    assert client.put(
        "/applications/draft",
        json={"form_data": {}},
    ).status_code == 401


def test_draft_update_is_rejected_after_application_submission() -> None:
    connection = _FakeConnection()
    connection.applications.add(("applicant-001", "camp-001"))

    response = _client_for(connection, "applicant-001").put(
        "/applications/draft",
        json={"form_data": {"full_name": "แก้ไขไม่ได้"}},
    )

    assert response.status_code == 409
    assert ("applicant-001", "camp-001") not in connection.drafts


def test_draft_api_rejects_payload_without_form_data_envelope() -> None:
    connection = _FakeConnection()

    response = _client_for(connection, "applicant-001").put(
        "/applications/draft",
        json={"full_name": "ข้อมูลฟอร์ม"},
    )

    assert response.status_code == 422
    assert connection.drafts == {}


def test_draft_api_rejects_document_data() -> None:
    connection = _FakeConnection()

    response = _client_for(connection, "applicant-001").put(
        "/applications/draft",
        json={"form_data": {"full_name": "ผู้สมัคร", "documents": []}},
    )

    assert response.status_code == 422
    assert response.json()["errors"] == [
        {"field_name": "documents", "error_message": "ไม่รองรับข้อมูลช่องนี้"}
    ]
    assert connection.drafts == {}


@pytest.mark.parametrize("failure_point", ["draft_upsert"])
def test_draft_save_reports_database_failure_without_success_fallback(
    failure_point: str,
) -> None:
    connection = _FakeConnection(fail_on=failure_point)
    original_draft = {
        "draft_id": "existing-draft",
        "form_data": {"full_name": "ก่อนแก้"},
        "last_saved_at": "2026-11-08T00:00:00+00:00",
    }
    key = ("applicant-001", "camp-001")
    connection.drafts[key] = copy.deepcopy(original_draft)

    response = _client_for(
        connection,
        "applicant-001",
        raise_server_exceptions=False,
    ).put(
        "/applications/draft",
        json={"form_data": {"full_name": "หลังแก้"}},
    )

    assert response.status_code == 500
    assert connection.drafts[key] == original_draft


class _FakeConnection:
    def __init__(self, *, fail_on: str | None = None) -> None:
        self.fail_on = fail_on
        self.drafts: dict[tuple[str, str], dict[str, Any]] = {}
        self.applications: set[tuple[str, str]] = set()

    def __enter__(self) -> _FakeConnection:
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> bool:
        return False

    def cursor(self) -> _FakeCursor:
        return _FakeCursor(self)

    @contextmanager
    def transaction(self):
        snapshot = copy.deepcopy((self.drafts, self.applications))
        try:
            yield self
        except Exception:
            self.drafts, self.applications = snapshot
            raise


class _FakeCursor:
    def __init__(self, connection: _FakeConnection) -> None:
        self.connection = connection
        self.rows: list[tuple[Any, ...]] = []

    def __enter__(self) -> _FakeCursor:
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        return None

    def execute(self, query: str, parameters: tuple[Any, ...]) -> None:
        normalized_query = " ".join(query.split())
        if normalized_query.startswith("SELECT application_id FROM applications"):
            self.rows = [(parameters[0],)] if parameters[:2] in self.connection.applications else []
        elif normalized_query.startswith("INSERT INTO application_drafts"):
            if self.connection.fail_on == "draft_upsert":
                raise RuntimeError("simulated database failure")
            draft_id, applicant_id, camp_id, form_data_json = parameters
            key = (applicant_id, camp_id)
            existing = self.connection.drafts.get(key)
            saved_id = existing["draft_id"] if existing else draft_id
            self.connection.drafts[key] = {
                "draft_id": saved_id,
                "form_data": json.loads(form_data_json),
                "form_data_json": form_data_json,
                "last_saved_at": datetime.now(timezone.utc).isoformat(),
            }
            self.rows = [(saved_id, self.connection.drafts[key]["last_saved_at"])]
        elif normalized_query.startswith("SELECT draft_id, form_data_json, last_saved_at"):
            applicant_id, camp_id = parameters
            draft = self.connection.drafts.get((applicant_id, camp_id))
            self.rows = (
                [(draft["draft_id"], draft["form_data_json"], draft["last_saved_at"])]
                if draft
                else []
            )
        else:
            raise AssertionError(f"Unexpected SQL: {normalized_query}")

    def fetchone(self) -> tuple[Any, ...] | None:
        return self.rows[0] if self.rows else None
