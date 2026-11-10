from __future__ import annotations

import base64
import copy
import json
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from itsdangerous import TimestampSigner

from backend.app.api.camp_enrollment import get_camp_connection
from backend.main import create_app

TEST_SECRET = "test-enrollment-submit-session-secret"


def test_AC_ENR_04_submit_success_sets_review_status(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: A signed-in applicant has a complete Draft for the configured open camp.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    connection.drafts[("applicant-001", "camp-001")] = {
        "draft_id": "draft-001",
        "form_data_json": json.dumps(_valid_form()),
    }
    client = _submission_client(connection, "applicant-001")

    # When: The applicant confirms submission, even if a body attempts to select another camp.
    response = client.post(
        "/applications/submit",
        json={"camp_id": "camp-002"},
    )

    # Then: A submitted Application is created for the configured camp with the form data.
    assert response.status_code == 201
    result = response.json()
    assert UUID(result["application_id"])
    assert result["camp_id"] == "camp-001"
    assert result["status"] == "submitted"
    assert result["form_data"] == _valid_form()
    application = connection.applications[("applicant-001", "camp-001")]
    assert application["form_data"] == _valid_form()
    assert application["status"] == "submitted"

    # Then: Draft is submitted without creating an Application document.
    assert ("applicant-001", "camp-001") not in connection.drafts
    assert connection.documents == {}


def _valid_form() -> dict[str, str]:
    return {
        "full_name": "ผู้สมัคร ตัวอย่าง",
        "nickname": "น้อง",
        "student_id": "66000001",
        "year_level": "2",
        "phone_number": "0800000000",
        "contact_channel": "line-id",
        "food_allergy": "no",
    }


def test_submit_validation_failure_returns_errors_and_preserves_draft(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: A signed-in applicant has a Draft missing required fields.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection(
    )
    connection.drafts[("applicant-001", "camp-001")] = {
        "draft_id": "draft-001",
        "form_data_json": '{"full_name":"ผู้สมัคร ตัวอย่าง","food_allergy":"yes"}',
    }
    client = _submission_client(connection, "applicant-001")

    # When: The applicant confirms submission.
    response = client.post("/applications/submit")

    # Then: Field errors are returned and Draft remains without an Application.
    assert response.status_code == 422
    error_fields = {
        error["field_name"] for error in response.json()["errors"]
    }
    assert {
        "nickname",
        "student_id",
        "year_level",
        "phone_number",
        "contact_channel",
        "food_allergy_details",
    }.issubset(error_fields)
    assert connection.drafts[("applicant-001", "camp-001")]["draft_id"] == "draft-001"
    assert connection.applications == {}


@pytest.mark.parametrize(
    ("camp_status", "expected_status"),
    [("closed", 409)],
)
def test_submit_rejects_closed_camp(
    monkeypatch: pytest.MonkeyPatch,
    camp_status: str,
    expected_status: int,
) -> None:
    # Given: A Draft exists but the camp configured on the server is closed.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection(camp_status=camp_status)
    connection.drafts[("applicant-001", "camp-001")] = {
        "draft_id": "draft-001",
        "form_data_json": json.dumps(_valid_form()),
    }

    # When: The applicant confirms submission.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: No Application is created and the Draft is preserved.
    assert response.status_code == expected_status
    assert connection.applications == {}
    assert ("applicant-001", "camp-001") in connection.drafts


def test_submit_without_draft_returns_not_found(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()

    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    assert response.status_code == 404
    assert connection.applications == {}


def test_submit_rejects_existing_application(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    connection.applications[("applicant-001", "camp-001")] = {
        "application_id": "existing-application",
        "form_data": {"full_name": "Applicant One", "student_id": "1001"},
        "status": "submitted",
    }

    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    assert response.status_code == 409
    assert connection.applications[("applicant-001", "camp-001")][
        "application_id"
    ] == "existing-application"


def test_submit_rejects_missing_configured_camp(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-missing")
    connection = _SubmissionFakeConnection(camp_exists=False)
    connection.drafts[("applicant-001", "camp-missing")] = {
        "draft_id": "draft-001",
        "form_data_json": json.dumps(_valid_form()),
    }

    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Configuration Error"}
    assert connection.applications == {}


def test_submit_rejects_missing_session(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_SubmissionFakeConnection]:
        with connection:
            yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    with TestClient(app) as client:
        response = client.post("/applications/submit")

    assert response.status_code == 401
    assert connection.applications == {}


def test_submit_rolls_back_application_and_draft_deletion_on_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: A valid Draft and a simulated failure when deleting the Draft.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection(fail_on="draft_delete")
    connection.drafts[("applicant-001", "camp-001")] = {
        "draft_id": "draft-001",
        "form_data_json": json.dumps(_valid_form()),
    }
    original_draft = copy.deepcopy(connection.drafts)

    # When: Submit fails after creating the Application.
    client = _submission_client(connection, "applicant-001", raise_server_exceptions=False)
    response = client.post("/applications/submit")

    # Then: The whole transaction is rolled back.
    assert response.status_code == 500
    assert connection.applications == {}
    assert connection.drafts == original_draft
    assert connection.documents == {}
    assert connection.rollback_count == 1


def test_TC_ENR_04_3_submit_complete_draft(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID is configured to an open camp; the signed-in applicant has a complete Draft.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    # When: The applicant confirms submission without selecting camp_id in the request.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: The Application is created from Draft data for CAMP_ID with submitted status.
    assert response.status_code == 201
    result = response.json()
    assert UUID(result["application_id"])
    assert result["camp_id"] == "camp-001"
    assert result["status"] == "submitted"
    assert connection.applications[("applicant-001", "camp-001")]["form_data"] == _valid_form()
    assert connection.applications[("applicant-001", "camp-001")]["status"] == "submitted"
    # Then: No document is required or created for submission.
    assert connection.documents == {}
    # Then: The Draft is removed after successful submission.
    assert ("applicant-001", "camp-001") not in connection.drafts
    # Staff Review listing and applicant status display are deferred to T-10/T-11.


def test_TC_ENR_04_4_duplicate_submit_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID is configured and an Application is already submitted by the applicant.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    existing_application = {
        "application_id": "existing-application",
        "form_data": {"full_name": "Existing Applicant", "student_id": "1000"},
        "status": "submitted",
    }
    connection.applications[("applicant-001", "camp-001")] = copy.deepcopy(
        existing_application
    )
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    original_draft = copy.deepcopy(connection.drafts)

    # When: The applicant tries to submit again.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: No duplicate Application is created and the submitted Application remains unchanged.
    assert response.status_code == 409
    assert connection.applications[("applicant-001", "camp-001")] == existing_application
    # Then: Any Draft is not deleted by the duplicate submission attempt.
    assert connection.drafts == original_draft


def test_TC_ENR_04_5_closed_camp_submit_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID identifies a camp that is not open and the applicant has a complete Draft.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection(camp_status="closed")
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    original_draft = copy.deepcopy(connection.drafts)

    # When: The applicant confirms submission.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: No Application is created and the Draft remains.
    assert response.status_code == 409
    assert connection.applications == {}
    assert connection.drafts == original_draft
    # Then: Submission is not redirected to another camp.
    assert ("applicant-001", "camp-002") not in connection.applications


def test_TC_ENR_04_6_submit_requires_session(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID is configured to an open camp; the user has no Session and a Draft exists.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    original_draft = copy.deepcopy(connection.drafts)
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_SubmissionFakeConnection]:
        with connection:
            yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection

    # When: The user calls POST /applications/submit without a Session.
    with TestClient(app) as client:
        response = client.post("/applications/submit")

    # Then: The API rejects the request with HTTP 401.
    assert response.status_code == 401
    # Then: No Application is created and the Draft/files remain unchanged.
    assert connection.applications == {}
    assert connection.drafts == original_draft


def test_TC_ENR_04_7_submit_without_camp_id_is_configuration_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: The applicant is signed in and has a Draft, but CAMP_ID is not configured.
    monkeypatch.delenv("CAMP_ID", raising=False)
    connection = _SubmissionFakeConnection()
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    original_draft = copy.deepcopy(connection.drafts)

    # When: The applicant calls POST /applications/submit.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: The API returns Configuration Error without falling back to another camp.
    assert response.status_code == 500
    assert response.json() == {"detail": "Configuration Error"}
    # Then: No Application is created and the Draft is preserved.
    assert connection.applications == {}
    assert connection.drafts == original_draft


def test_TC_ENR_04_8_missing_configured_camp_is_configuration_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID is configured but its camp record is missing; the applicant has a Draft.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection(camp_exists=False)
    _seed_complete_draft(connection, "applicant-001", "camp-001")
    original_draft = copy.deepcopy(connection.drafts)

    # When: The applicant calls POST /applications/submit.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: The API returns Configuration Error without falling back to another camp.
    assert response.status_code == 500
    assert response.json() == {"detail": "Configuration Error"}
    # Then: No Application is created and the Draft is preserved.
    assert connection.applications == {}
    assert connection.drafts == original_draft


def test_TC_ENR_04_9_submit_without_draft_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Given: CAMP_ID is configured and open; the signed-in applicant has no Draft for that camp.
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _SubmissionFakeConnection()
    connection.drafts[("another-applicant", "camp-001")] = {
        "draft_id": "other-applicant-draft",
        "form_data_json": json.dumps(_valid_form()),
    }
    connection.drafts[("applicant-001", "camp-002")] = {
        "draft_id": "other-camp-draft",
        "form_data_json": json.dumps(_valid_form()),
    }
    original_draft = copy.deepcopy(connection.drafts)

    # When: The applicant calls POST /applications/submit.
    response = _submission_client(connection, "applicant-001").post(
        "/applications/submit"
    )

    # Then: The API returns HTTP 404 and creates no Application.
    assert response.status_code == 404
    assert connection.applications == {}
    # Then: No Draft or data from another applicant/camp is used or modified.
    assert connection.drafts == original_draft


def _submission_client(
    connection: _SubmissionFakeConnection,
    user_id: str,
    *,
    raise_server_exceptions: bool = True,
) -> TestClient:
    app = create_app(
        secret_key=TEST_SECRET,
        database_initializer=lambda: None,
    )

    def provide_connection() -> Iterator[_SubmissionFakeConnection]:
        with connection:
            yield connection

    app.dependency_overrides[get_camp_connection] = provide_connection
    client = TestClient(app, raise_server_exceptions=raise_server_exceptions)
    payload = base64.b64encode(json.dumps({"user_id": user_id}).encode("utf-8"))
    client.cookies.set(
        "session",
        TimestampSigner(TEST_SECRET).sign(payload).decode("utf-8"),
    )
    return client


def _seed_complete_draft(
    connection: _SubmissionFakeConnection,
    applicant_id: str,
    camp_id: str,
) -> None:
    draft_id = f"draft-{applicant_id}-{camp_id}"
    connection.drafts[(applicant_id, camp_id)] = {
        "draft_id": draft_id,
        "form_data_json": json.dumps(_valid_form()),
    }


class _FakeConnection:
    """Provide camp records for the configured-camp validation query."""

    def __init__(self, camps: list[tuple[Any, ...]]) -> None:
        self.camps = camps
        self.query_parameters: tuple[str, ...] | None = None

    def cursor(self) -> _FakeCursor:
        return _FakeCursor(self)


class _FakeCursor:
    def __init__(self, connection: _FakeConnection) -> None:
        self.connection = connection
        self.result: tuple[Any, ...] | None = None

    def __enter__(self) -> _FakeCursor:
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str, parameters: tuple[str, ...]) -> None:
        self.connection.query_parameters = parameters
        camp_id = parameters[0]
        self.result = next(
            (camp for camp in self.connection.camps if camp[0] == camp_id),
            None,
        )

    def fetchone(self) -> tuple[Any, ...] | None:
        return self.result


class _SubmissionFakeConnection:
    """Transactional fake for the submit endpoint's PostgreSQL statements."""

    def __init__(
        self,
        *,
        camp_status: str = "open",
        required_fields: list[str] | None = None,
        required_documents: list[str] | None = None,
        fail_on: str | None = None,
        camp_exists: bool = True,
    ) -> None:
        self.camp_status = camp_status
        self.required_fields = required_fields or []
        self.required_documents = required_documents or []
        self.fail_on = fail_on
        self.camp_exists = camp_exists
        self.drafts: dict[tuple[str, str], dict[str, Any]] = {}
        self.documents: dict[str, dict[str, Any]] = {}
        self.applications: dict[tuple[str, str], dict[str, Any]] = {}
        self.rollback_count = 0

    def __enter__(self) -> _SubmissionFakeConnection:
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        return False

    def cursor(self) -> _SubmissionFakeCursor:
        return _SubmissionFakeCursor(self)

    @contextmanager
    def transaction(self):
        snapshot = copy.deepcopy((self.drafts, self.documents, self.applications))
        try:
            yield self
        except Exception:
            self.drafts, self.documents, self.applications = snapshot
            self.rollback_count += 1
            raise


class _SubmissionFakeCursor:
    def __init__(self, connection: _SubmissionFakeConnection) -> None:
        self.connection = connection
        self.query = ""
        self.result: list[tuple[Any, ...]] = []

    def __enter__(self) -> _SubmissionFakeCursor:
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str, parameters: tuple[Any, ...]) -> None:
        self.query = " ".join(query.split())

        if self.query.startswith("SELECT camp_id, name, status"):
            (camp_id,) = parameters
            self.result = (
                [
                    (
                        camp_id,
                        "Configured Camp",
                        self.connection.camp_status,
                        None,
                        None,
                        json.dumps(self.connection.required_fields),
                        json.dumps(self.connection.required_documents),
                    )
                ]
                if self.connection.camp_exists
                else []
            )
        elif self.query.startswith("SELECT application_id FROM applications"):
            applicant_id, camp_id = parameters
            application = self.connection.applications.get((applicant_id, camp_id))
            self.result = [(application["application_id"],)] if application else []
        elif self.query.startswith("SELECT draft_id, form_data_json FROM application_drafts"):
            applicant_id, camp_id = parameters
            draft = self.connection.drafts.get((applicant_id, camp_id))
            self.result = (
                [(draft["draft_id"], draft["form_data_json"])] if draft else []
            )
        elif self.query.startswith("INSERT INTO applications"):
            application_id, applicant_id, camp_id, form_data_json = parameters
            if (applicant_id, camp_id) in self.connection.applications:
                self.result = []
            else:
                self.connection.applications[(applicant_id, camp_id)] = {
                    "application_id": application_id,
                    "form_data": json.loads(form_data_json),
                    "status": "submitted",
                }
                self.result = [(application_id,)]
        elif self.query.startswith("UPDATE application_documents"):
            (draft_id,) = parameters
            for document in self.connection.documents.values():
                if document["draft_id"] == draft_id:
                    document["draft_id"] = None
            self.result = []
        elif self.query.startswith("DELETE FROM application_drafts"):
            if self.connection.fail_on == "draft_delete":
                raise RuntimeError("simulated database failure")
            (draft_id,) = parameters
            for key, draft in list(self.connection.drafts.items()):
                if draft["draft_id"] == draft_id:
                    del self.connection.drafts[key]
            self.result = []
        else:
            raise AssertionError(f"Unexpected SQL in fake connection: {self.query}")

    def fetchone(self) -> tuple[Any, ...] | None:
        return self.result[0] if self.result else None

    def fetchall(self) -> list[tuple[Any, ...]]:
        return self.result
