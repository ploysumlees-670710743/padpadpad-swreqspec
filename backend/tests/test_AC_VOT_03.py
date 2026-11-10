import sqlite3

from fastapi.testclient import TestClient

from backend.app.api.votes import get_vote_service
from backend.app.main import app
from backend.app.middleware.authz import get_authenticated_voter_id
from backend.app.services.vote_service import VoteService


def test_AC_VOT_03_forbid_voter_without_role_for_current_round(tmp_path) -> None:
    voter_id = "student-001"
    round_id = "round-current"
    location_id = "location-001"
    database_path = tmp_path / "votes.sqlite3"
    service = VoteService(database_path)
    service.initialize()
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            INSERT INTO vote_eligible_users (user_id, round_id, role)
            VALUES (?, ?, ?)
            """,
            (voter_id, "round-other", "committee"),
        )

    app.dependency_overrides[get_authenticated_voter_id] = lambda: voter_id
    app.dependency_overrides[get_vote_service] = lambda: service

    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/votes",
                json={"round_id": round_id, "location_id": location_id},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "ผู้ใช้ไม่มีสิทธิ์ลงคะแนน"
    with sqlite3.connect(database_path) as connection:
        ballot_count = connection.execute(
            "SELECT COUNT(*) FROM vote_ballots WHERE round_id = ?",
            (round_id,),
        ).fetchone()[0]
    assert ballot_count == 0


def test_AC_VOT_03_reject_when_authentication_identity_is_unavailable(tmp_path) -> None:
    service = VoteService(tmp_path / "votes.sqlite3")
    service.initialize()
    app.dependency_overrides[get_vote_service] = lambda: service

    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/votes",
                json={"round_id": "round-current", "location_id": "location-001"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json()["detail"] == "ระบบยืนยันตัวตนขัดข้อง"
