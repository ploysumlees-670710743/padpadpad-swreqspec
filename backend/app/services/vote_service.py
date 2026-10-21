"""Voting persistence and transaction handling for UC-08."""

import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parents[2] / "db" / "application_status.sqlite3"
SCHEMA_PATH = Path(__file__).resolve().parents[2] / "db" / "schema.sql"


class IneligibleVoterError(Exception):
    """Raised when a user has no voting role for the requested round (FR-VOT-02)."""


class AlreadyVotedError(Exception):
    """Raised when a voter has already used their right in the round (FR-VOT-04)."""


class VoteService:
    """Persist anonymous ballots and voter eligibility separately (CON-DATA-01, CON-TECH-01)."""

    def __init__(self, database_path: Path = DATABASE_PATH) -> None:
        self.database_path = database_path

    def initialize(self) -> None:
        """Initialize voting tables from the shared schema (FR-VOT-04, CON-DATA-01)."""

        with sqlite3.connect(self.database_path) as connection:
            connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    def cast_vote(self, user_id: str, round_id: str, location_id: str) -> int:
        """Save an anonymous ballot and return its round/location total (FR-VOT-03, FR-VOT-05)."""

        with sqlite3.connect(self.database_path, timeout=5) as connection:
            connection.execute("BEGIN IMMEDIATE")

            role = connection.execute(
                """
                SELECT role FROM vote_eligible_users
                WHERE user_id = ? AND round_id = ?
                """,
                (user_id, round_id),
            ).fetchone()
            if role is None:
                raise IneligibleVoterError

            eligibility = connection.execute(
                """
                SELECT has_voted FROM vote_eligibility
                WHERE user_id = ? AND round_id = ?
                """,
                (user_id, round_id),
            ).fetchone()
            if eligibility is not None and eligibility[0]:
                raise AlreadyVotedError

            if eligibility is None:
                connection.execute(
                    """
                    INSERT INTO vote_eligibility (user_id, round_id, has_voted)
                    VALUES (?, ?, 1)
                    """,
                    (user_id, round_id),
                )
            else:
                connection.execute(
                    """
                    UPDATE vote_eligibility SET has_voted = 1
                    WHERE user_id = ? AND round_id = ?
                    """,
                    (user_id, round_id),
                )

            connection.execute(
                "INSERT INTO vote_ballots (round_id, location_id) VALUES (?, ?)",
                (round_id, location_id),
            )
            total_votes = connection.execute(
                """
                SELECT COUNT(*) FROM vote_ballots
                WHERE round_id = ? AND location_id = ?
                """,
                (round_id, location_id),
            ).fetchone()[0]
            return total_votes
