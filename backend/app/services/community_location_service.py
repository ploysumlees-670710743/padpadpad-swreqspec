"""UC-01 community records scoped to committee-assigned camp locations.

Team-chosen implementation (not required by spec): SQLite, consistent with UC-08/UC-14.
The UC-09 authentication integration must populate request.state identity; this service
does not grant assignments or infer permissions from client input.
"""
import sqlite3
from pathlib import Path
from uuid import uuid4

DEFAULT_DB = Path(__file__).resolve().parents[2] / "db" / "application_status.sqlite3"

SCHEMA = """
CREATE TABLE IF NOT EXISTS uc01_community_assignments (
    user_id TEXT NOT NULL,
    location_id TEXT NOT NULL REFERENCES camp_locations(location_id),
    PRIMARY KEY (user_id, location_id)
);
CREATE TABLE IF NOT EXISTS uc01_communities (
    community_id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL REFERENCES camp_locations(location_id),
    community_name TEXT NOT NULL,
    local_rules TEXT NOT NULL DEFAULT '',
    caretaker_name TEXT NOT NULL,
    caretaker_title TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uc01_communities_location
    ON uc01_communities(location_id);
"""


class CommunityService:
    """UC-01: FR-01-02..05, AF-01-01, AC-01, C-01, C-02."""

    def __init__(self, database_path: Path = DEFAULT_DB):
        self.database_path = Path(database_path)

    def connect(self):
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def initialize(self):
        """Create only UC-01 tables; shared camp_locations must already exist (C-01)."""
        with self.connect() as connection:
            connection.executescript(SCHEMA)

    @staticmethod
    def require_assignment(connection, user_id, location_id):
        """Fail closed when UC-09 has not provisioned a location assignment (C-01)."""
        allowed = connection.execute(
            "SELECT 1 FROM uc01_community_assignments WHERE user_id=? AND location_id=?",
            (user_id, location_id),
        ).fetchone()
        if allowed is None:
            raise PermissionError("ไม่มีสิทธิ์จัดการข้อมูลของสถานที่ค่ายนี้")

    def list_assigned_locations(self, user_id):
        """FR-01-02, C-01: expose only camp locations assigned to the signed-in committee member."""
        with self.connect() as connection:
            rows = connection.execute(
                """SELECT l.location_id, l.location_name
                   FROM uc01_community_assignments AS a
                   JOIN camp_locations AS l ON l.location_id=a.location_id
                   WHERE a.user_id=?
                   ORDER BY l.location_name, l.location_id""",
                (user_id,),
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def _record(connection, community_id):
        row = connection.execute(
            """SELECT community_id, location_id, community_name, local_rules,
                      caretaker_name, caretaker_title, contact_phone, created_at
               FROM uc01_communities WHERE community_id=?""",
            (community_id,),
        ).fetchone()
        return dict(row) if row is not None else None

    def create(self, user_id, location_id, fields):
        """Save community and caretaker linked to the assigned location (AC-01)."""
        with self.connect() as connection:
            self.require_assignment(connection, user_id, location_id)
            community_id = uuid4().hex
            connection.execute(
                """INSERT INTO uc01_communities
                   (community_id, location_id, community_name, local_rules,
                    caretaker_name, caretaker_title, contact_phone)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (community_id, location_id, fields["community_name"],
                 fields["local_rules"], fields["caretaker_name"],
                 fields["caretaker_title"], fields["contact_phone"]),
            )
            return self._record(connection, community_id)

    def list_for_location(self, user_id, location_id):
        """Return records for an assigned location only (FR-01-01, FR-01-02, C-01)."""
        with self.connect() as connection:
            self.require_assignment(connection, user_id, location_id)
            rows = connection.execute(
                """SELECT community_id, location_id, community_name, local_rules,
                          caretaker_name, caretaker_title, contact_phone, created_at
                   FROM uc01_communities WHERE location_id=?
                   ORDER BY created_at, community_id""",
                (location_id,),
            ).fetchall()
            return [dict(row) for row in rows]

    def update(self, user_id, community_id, fields):
        """Never permit changing location_id during an edit (C-01)."""
        with self.connect() as connection:
            row = connection.execute(
                "SELECT location_id FROM uc01_communities WHERE community_id=?",
                (community_id,),
            ).fetchone()
            if row is None:
                raise LookupError("ไม่พบข้อมูลชุมชน")
            self.require_assignment(connection, user_id, row["location_id"])
            connection.execute(
                """UPDATE uc01_communities SET community_name=?, local_rules=?,
                    caretaker_name=?, caretaker_title=?, contact_phone=?
                   WHERE community_id=?""",
                (fields["community_name"], fields["local_rules"],
                 fields["caretaker_name"], fields["caretaker_title"],
                 fields["contact_phone"], community_id),
            )
            return self._record(connection, community_id)
