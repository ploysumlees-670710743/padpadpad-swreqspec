"""Read application status and camp details for UC-14."""

import sqlite3
from pathlib import Path

from backend.app.models.application_status import ApplicationStatus

DATABASE_PATH = Path(__file__).resolve().parents[2] / "db" / "application_status.sqlite3"
SCHEMA_PATH = Path(__file__).resolve().parents[2] / "db" / "schema.sql"


class ApplicationStatusService:
    """Read only application status service (FR-STA-01, CON-SEC-01)."""

    def __init__(self, database_path: Path = DATABASE_PATH) -> None:
        self.database_path = database_path

    def initialize(self) -> None:
        """Create schema used by the status endpoint (FR-STA-01)."""

        with sqlite3.connect(self.database_path) as connection:
            connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    def get_for_student(self, student_id: str) -> list[ApplicationStatus]:
        """Return all applications owned by the authenticated student (FR-STA-01, CON-SEC-01)."""

        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                """
                SELECT application_id, application_status, camp_name,
                       activity_start_at, activity_end_at, camp_location,
                       preparation_info
                FROM applications
                WHERE student_id = ?
                ORDER BY application_id
                """,
                (student_id,),
            ).fetchall()
        return [
            ApplicationStatus(
                application_id=row["application_id"],
                status=row["application_status"],
                camp_name=row["camp_name"],
                activity_start_at=row["activity_start_at"],
                activity_end_at=row["activity_end_at"],
                camp_location=row["camp_location"],
                preparation_info=row["preparation_info"],
            )
            for row in rows
        ]

    def get_by_id(self, application_id: str) -> tuple[str, ApplicationStatus] | None:
        """Fetch an application with its owner for the API authorization check (CON-SEC-01)."""

        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                """
                SELECT student_id, application_id, application_status, camp_name,
                       activity_start_at, activity_end_at, camp_location,
                       preparation_info
                FROM applications
                WHERE application_id = ?
                """,
                (application_id,),
            ).fetchone()
        if row is None:
            return None
        application = ApplicationStatus(
            application_id=row["application_id"],
            status=row["application_status"],
            camp_name=row["camp_name"],
            activity_start_at=row["activity_start_at"],
            activity_end_at=row["activity_end_at"],
            camp_location=row["camp_location"],
            preparation_info=row["preparation_info"],
        )
        return row["student_id"], application
