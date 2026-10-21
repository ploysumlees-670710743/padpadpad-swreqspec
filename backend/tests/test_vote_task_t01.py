import sqlite3
from pathlib import Path

import pytest

from backend.app.models.vote import VoteBallot, VoteEligibility


SCHEMA_PATH = Path(__file__).resolve().parents[1] / "db" / "schema.sql"


def test_t01_vote_models_validate_required_fields_and_keep_ballot_anonymous() -> None:
    eligibility = VoteEligibility(user_id="user-001", round_id="round-001")
    ballot = VoteBallot(round_id="round-001", location_id="location-001")

    assert eligibility.has_voted is False
    assert ballot.round_id == eligibility.round_id
    assert not hasattr(ballot, "user_id")

    with pytest.raises(ValueError, match="user_id and round_id are required"):
        VoteEligibility(user_id="", round_id="round-001")
    with pytest.raises(ValueError, match="round_id and location_id are required"):
        VoteBallot(round_id="round-001", location_id="")


def test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot() -> None:
    with sqlite3.connect(":memory:") as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        connection.execute(
            "INSERT INTO vote_eligibility (user_id, round_id) VALUES (?, ?)",
            ("user-001", "round-001"),
        )
        with pytest.raises(sqlite3.IntegrityError):
            connection.execute(
                "INSERT INTO vote_eligibility (user_id, round_id) VALUES (?, ?)",
                ("user-001", "round-001"),
            )

        ballot_columns = {
            row[1]
            for row in connection.execute("PRAGMA table_info(vote_ballots)").fetchall()
        }
        assert {"ballot_id", "round_id", "location_id"} <= ballot_columns
        assert "user_id" not in ballot_columns


def test_t01_sqlite_vote_transaction_rolls_back_ballot_write() -> None:
    with sqlite3.connect(":memory:") as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        connection.execute("BEGIN")
        connection.execute(
            "INSERT INTO vote_ballots (round_id, location_id) VALUES (?, ?)",
            ("round-001", "location-001"),
        )
        connection.rollback()

        count = connection.execute("SELECT COUNT(*) FROM vote_ballots").fetchone()[0]
        assert count == 0
