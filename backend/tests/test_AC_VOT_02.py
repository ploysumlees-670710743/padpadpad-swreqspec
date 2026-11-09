import sqlite3

from fastapi.testclient import TestClient

from backend.app.api.votes import get_authenticated_voter_id, get_vote_service
from backend.app.main import app
from backend.app.services.vote_service import VoteService


def test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total(tmp_path) -> None:
    voter_id = "lecturer-002"
    round_id = "round-002"
    location_id = "location-002"
    database_path = tmp_path / "votes.sqlite3"
    service = VoteService(database_path)
    service.initialize()
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            INSERT INTO vote_eligible_users (user_id, round_id, role)
            VALUES (?, ?, ?)
            """,
            (voter_id, round_id, "lecturer"),
        )

    app.dependency_overrides[get_authenticated_voter_id] = lambda: voter_id
    app.dependency_overrides[get_vote_service] = lambda: service

    try:
        with TestClient(app) as client:
            first_response = client.post(
                "/api/votes",
                json={"round_id": round_id, "location_id": location_id},
            )
            duplicate_response = client.post(
                "/api/votes",
                json={"round_id": round_id, "location_id": location_id},
            )
    finally:
        app.dependency_overrides.clear()

    with sqlite3.connect(database_path) as connection:
        total_votes = connection.execute(
            """
            SELECT COUNT(*) FROM vote_ballots
            WHERE round_id = ? AND location_id = ?
            """,
            (round_id, location_id),
        ).fetchone()[0]

    assert first_response.status_code == 200
    assert first_response.json() == {"total_votes": 1, "has_voted": True}
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "ท่านได้ใช้สิทธิ์ไปแล้ว"
    assert total_votes == 1
