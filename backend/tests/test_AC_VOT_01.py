import sqlite3

from fastapi.testclient import TestClient

from backend.app.api.votes import get_authenticated_voter_id, get_vote_service
from backend.app.main import app
from backend.app.services.vote_service import VoteService


def test_TC_VOT_01_1_api_records_vote_and_updates_total(tmp_path) -> None:
    voter_id = "lecturer-001"
    round_id = "round-001"
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
            (voter_id, round_id, "lecturer"),
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

    assert response.status_code == 200
    assert response.json() == {"total_votes": 1, "has_voted": True}

    with sqlite3.connect(database_path) as connection:
        ballot_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(vote_ballots)")
        }
        ballot_count = connection.execute(
            """
            SELECT COUNT(*) FROM vote_ballots
            WHERE round_id = ? AND location_id = ?
            """,
            (round_id, location_id),
        ).fetchone()[0]
        eligibility = connection.execute(
            """
            SELECT has_voted FROM vote_eligibility
            WHERE user_id = ? AND round_id = ?
            """,
            (voter_id, round_id),
        ).fetchone()

    assert ballot_count == 1
    assert "user_id" not in ballot_columns
    assert eligibility == (1,)


def test_AC_VOT_01_successful_vote_records_total_and_marks_eligibility(tmp_path) -> None:
    # Given an authenticated lecturer who has not voted in the current round.
    voter_id = "lecturer-ac-001"
    round_id = "round-ac-001"
    location_id = "location-ac-001"
    database_path = tmp_path / "votes-ac.sqlite3"
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

    # When the lecturer selects one location and confirms the vote.
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/votes",
                json={"round_id": round_id, "location_id": location_id},
            )
    finally:
        app.dependency_overrides.clear()

    # Then the vote is saved, the total is returned, and eligibility is marked used.
    assert response.status_code == 200
    assert response.json() == {"total_votes": 1, "has_voted": True}

    with sqlite3.connect(database_path) as connection:
        ballot_count = connection.execute(
            """
            SELECT COUNT(*) FROM vote_ballots
            WHERE round_id = ? AND location_id = ?
            """,
            (round_id, location_id),
        ).fetchone()[0]
        eligibility = connection.execute(
            """
            SELECT has_voted FROM vote_eligibility
            WHERE user_id = ? AND round_id = ?
            """,
            (voter_id, round_id),
        ).fetchone()
        ballot_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(vote_ballots)")
        }

    assert ballot_count == 1
    assert eligibility == (1,)
    assert "user_id" not in ballot_columns
