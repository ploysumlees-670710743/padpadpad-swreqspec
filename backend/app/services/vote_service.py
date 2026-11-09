"""Voting persistence and transaction handling for UC-08."""

import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parents[2] / "db" / "application_status.sqlite3"
SCHEMA_PATH = Path(__file__).resolve().parents[2] / "db" / "schema.sql"

DEMO_LOCATION_IMAGE = (
    "data:image/svg+xml,"
    "%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' "
    "viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23dbeafe'/%3E"
    "%3Cpath d='M0 280 150 130l120 110 110-140 260 180v80H0z' fill='%2386a789'/%3E"
    "%3Ccircle cx='500' cy='85' r='38' fill='%23fbbf24'/%3E"
    "%3Ctext x='320' y='330' text-anchor='middle' font-family='sans-serif' "
    "font-size='24' fill='%231f2937'%3E%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%95%E0%B8%B1"
    "%E0%B8%A7%E0%B8%AD%E0%B8%A2%E0%B9%88%E0%B8%B2%E0%B8%87%3C/text%3E%3C/svg%3E"
)

DEMO_LOCATIONS = (
    {
        "location_id": "demo-location-001",
        "name": "ศูนย์เรียนรู้ชุมชน",
        "image_url": DEMO_LOCATION_IMAGE,
        "survey_summary": "ตัวอย่าง: มีพื้นที่ทำกิจกรรมและพื้นที่พักผ่อน",
        "total_votes": 3,
    },
    {
        "location_id": "demo-location-002",
        "name": "อุทยานการเรียนรู้",
        "image_url": DEMO_LOCATION_IMAGE,
        "survey_summary": "ตัวอย่าง: มีพื้นที่ธรรมชาติและจุดเรียนรู้ภายในพื้นที่",
        "total_votes": 2,
    },
    {
        "location_id": "demo-location-003",
        "name": "ศูนย์กิจกรรมเยาวชน",
        "image_url": DEMO_LOCATION_IMAGE,
        "survey_summary": "ตัวอย่าง: มีอาคารกิจกรรมและพื้นที่รองรับกลุ่มผู้เข้าร่วม",
        "total_votes": 1,
    },
)


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

    def get_vote_locations(self, round_id: str) -> dict[str, object]:
        """Return the team-approved mock location list for the prototype (FR-VOT-01, FR-VOT-05)."""

        locations = [location.copy() for location in DEMO_LOCATIONS]
        locations.sort(key=lambda location: location["total_votes"], reverse=True)
        return {
            "round_id": round_id,
            "has_voted": False,
            "locations": locations,
        }

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
