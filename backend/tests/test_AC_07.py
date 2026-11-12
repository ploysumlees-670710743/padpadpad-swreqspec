"""UC-07 AC-07 Given/When/Then, authorization, revision and immutable history."""
import sqlite3

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.project_approval import (
    get_actor, get_project_approval_service, router,
)
from backend.app.services.project_approval_service import ProjectApprovalService


@pytest.fixture
def scenario(tmp_path):
    database = tmp_path / "uc07.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.executescript("""
        CREATE TABLE camp_projects (project_id TEXT PRIMARY KEY, project_name TEXT NOT NULL);
        INSERT INTO camp_projects (project_id, project_name) VALUES ('p-1','ค่ายชุมชน'), ('p-2','ค่ายอื่น');
        """)
    service = ProjectApprovalService(database)
    service.initialize()
    with service.connect() as connection:
        connection.executemany(
            """INSERT INTO uc07_project_memberships(project_id,user_id,role)
               VALUES (?,?,?)""",
            [('p-1', 'committee-1', 'committee'),
             ('p-1', 'advisor-1', 'advisor'),
             ('p-2', 'committee-2', 'committee'),
             ('p-2', 'advisor-2', 'advisor')],
        )
    application = FastAPI()
    application.include_router(router)
    application.dependency_overrides[get_actor] = lambda: ("committee-1", "committee")
    application.dependency_overrides[get_project_approval_service] = lambda: service
    with TestClient(application) as client:
        yield client, application, service
    application.dependency_overrides.clear()


def set_actor(application, user_id, role):
    application.dependency_overrides[get_actor] = lambda: (user_id, role)


@pytest.mark.parametrize("decision", ["approved", "rejected", "revision"])
def test_AC_07_Given_When_Then_records_decision_history_and_notification(scenario, decision):
    # Given: committee submitted, assigned adviser has authenticated.
    client, application, service = scenario
    submitted = client.post("/api/projects/p-1/approval/submit")
    assert submitted.status_code == 201
    assert submitted.json()["status"] == "pending"
    set_actor(application, "advisor-1", "faculty")
    # When: adviser chooses one of three dispositions and supplies feedback.
    result = client.post(
        "/api/projects/p-1/approval",
        json={"decision": decision, "feedback": "พิจารณาแล้ว"},
    )
    # Then: status and immutable history saved; committee receives in-app notification.
    assert result.status_code == 200
    assert result.json()["status"] == decision
    assert result.json()["history"][-1]["actor_id"] == "advisor-1"
    assert result.json()["history"][-1]["action"] == decision
    with service.connect() as connection:
        audit_rows = connection.execute(
            "SELECT COUNT(*) FROM uc07_approval_history WHERE project_id='p-1'"
        ).fetchone()[0]
        assert audit_rows == 2
    set_actor(application, "committee-1", "committee")
    notices = client.get("/api/projects/p-1/approval/notifications")
    assert notices.status_code == 200
    assert len(notices.json()) == 1
    assert notices.json()[0]["status"] == decision


def test_AC_07_unauthorized_faculty_cannot_review_other_project(scenario):
    client, application, _ = scenario
    assert client.post("/api/projects/p-1/approval/submit").status_code == 201
    set_actor(application, "advisor-2", "faculty")
    result = client.post(
        "/api/projects/p-1/approval",
        json={"decision": "approved", "feedback": "ok"},
    )
    assert result.status_code == 403
    set_actor(application, "committee-1", "committee")
    assert client.get("/api/projects/p-1/approval").json()["status"] == "pending"


def test_AC_07_revision_allows_resubmit_but_rejection_is_terminal(scenario):
    client, application, _ = scenario
    assert client.post("/api/projects/p-1/approval/submit").status_code == 201
    set_actor(application, "advisor-1", "faculty")
    assert client.post(
        "/api/projects/p-1/approval",
        json={"decision": "revision", "feedback": "แก้เอกสาร"},
    ).status_code == 200
    set_actor(application, "committee-1", "committee")
    resent = client.post("/api/projects/p-1/approval/submit")
    assert resent.status_code == 201
    assert [item["action"] for item in resent.json()["history"]] == [
        "submitted", "revision", "submitted",
    ]
    set_actor(application, "advisor-1", "faculty")
    assert client.post(
        "/api/projects/p-1/approval",
        json={"decision": "rejected", "feedback": "ไม่ผ่าน"},
    ).status_code == 200
    set_actor(application, "committee-1", "committee")
    assert client.post("/api/projects/p-1/approval/submit").status_code == 409


def test_AC_07_audit_log_cannot_be_edited_or_deleted(scenario):
    client, _, service = scenario
    client.post("/api/projects/p-1/approval/submit")
    with service.connect() as connection:
        history_id = connection.execute(
            "SELECT history_id FROM uc07_approval_history LIMIT 1",
        ).fetchone()[0]
        with pytest.raises(sqlite3.IntegrityError):
            connection.execute(
                "UPDATE uc07_approval_history SET feedback='changed' WHERE history_id=?",
                (history_id,),
            )
        with pytest.raises(sqlite3.IntegrityError):
            connection.execute(
                "DELETE FROM uc07_approval_history WHERE history_id=?",
                (history_id,),
            )
    with service.connect() as connection:
        assert connection.execute("SELECT COUNT(*) FROM uc07_approval_history").fetchone()[0] == 1


def test_AC_07_requires_reason_for_rejection_and_revision(scenario):
    client, application, _ = scenario
    client.post("/api/projects/p-1/approval/submit")
    set_actor(application, "advisor-1", "faculty")
    assert client.post(
        "/api/projects/p-1/approval",
        json={"decision": "revision", "feedback": ""},
    ).status_code == 409
    assert client.get("/api/projects/p-1/approval").json()["status"] == "pending"


def test_AC_07_unauthenticated_role_fails_closed(scenario):
    client, application, _ = scenario
    application.dependency_overrides.pop(get_actor)
    assert client.post("/api/projects/p-1/approval/submit").status_code == 401

def test_AC_07_status_includes_trusted_viewer_role_for_ui_controls(scenario):
    # The client does not select the identity or role. The server derives it
    # from authenticated actor dependencies and validates project membership.
    client, application, _ = scenario
    committee_view = client.get("/api/projects/p-1/approval")
    assert committee_view.status_code == 200
    assert committee_view.json()["viewer_role"] == "committee"

    set_actor(application, "advisor-1", "faculty")
    faculty_view = client.get("/api/projects/p-1/approval")
    assert faculty_view.status_code == 200
    assert faculty_view.json()["viewer_role"] == "faculty"

    set_actor(application, "advisor-2", "faculty")
    assert client.get("/api/projects/p-1/approval").status_code == 403

    application.dependency_overrides.pop(get_actor)
    assert client.get("/api/projects/p-1/approval").status_code == 401
