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

TEST_SECRET = "test-food-allergy-session-secret"


def test_AC_ENR_03_allergy_details_are_required_for_submit(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionConnection()
    connection.drafts[("applicant-001", "camp-001")] = {
        "draft_id": "draft-001",
        "form_data_json": json.dumps(
            {
                "full_name": "ผู้สมัคร ตัวอย่าง",
                "nickname": "น้อง",
                "student_id": "66000001",
                "year_level": "2",
                "phone_number": "0800000000",
                "contact_channel": "line-id",
                "food_allergy": "yes",
            },
            ensure_ascii=False,
        ),
    }

    response = _client_for(connection).post("/applications/submit")

    assert response.status_code == 422
    assert response.json() == {
        "errors": [
            {
                "field_name": "food_allergy_details",
                "error_message": "กรุณากรอกข้อมูลนี้",
            }
        ]
    }
    assert ("applicant-001", "camp-001") in connection.drafts
    assert connection.applications == {}


def _client_for(connection: _SubmissionConnection) -> TestClient:
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_SubmissionConnection]:
        yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    client = TestClient(app)
    payload = base64.b64encode(json.dumps({"user_id": "applicant-001"}).encode())
    client.cookies.set(
        "session",
        TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8"),
    )
    return client


class _SubmissionConnection:
    def __init__(self) -> None:
        self.drafts: dict[tuple[str, str], dict[str, Any]] = {}
        self.applications: dict[tuple[str, str], dict[str, Any]] = {}

    def cursor(self) -> "_SubmissionCursor":
        return _SubmissionCursor(self)


class _SubmissionCursor:
    def __init__(self, connection: _SubmissionConnection) -> None:
        self.connection = connection
        self.rows: list[tuple[Any, ...]] = []

    def __enter__(self) -> "_SubmissionCursor":
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        return None

    def execute(self, query: str, parameters: tuple[Any, ...]) -> None:
        normalized_query = " ".join(query.split())
        if normalized_query.startswith("SELECT camp_id, name, status"):
            (camp_id,) = parameters
            self.rows = [
                (camp_id, "Configured Camp", "open", None, None, "[]", "[]")
            ]
        elif normalized_query.startswith("SELECT application_id FROM applications"):
            applicant_id, camp_id = parameters
            application = self.connection.applications.get((applicant_id, camp_id))
            self.rows = [(application["application_id"],)] if application else []
        elif normalized_query.startswith(
            "SELECT draft_id, form_data_json FROM application_drafts"
        ):
            applicant_id, camp_id = parameters
            draft = self.connection.drafts.get((applicant_id, camp_id))
            self.rows = [(draft["draft_id"], draft["form_data_json"])] if draft else []
        else:
            raise AssertionError(f"Unexpected SQL: {normalized_query}")

    def fetchone(self) -> tuple[Any, ...] | None:
        return self.rows[0] if self.rows else None
