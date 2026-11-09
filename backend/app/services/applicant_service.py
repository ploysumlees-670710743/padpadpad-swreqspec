"""Applicant editing persistence service."""

import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from backend.app.db.transaction import transaction
from backend.app.validators.applicant_validator import (
    editable_changes,
    validate_applicant_payload,
)

DATABASE_PATH = Path(__file__).resolve().parents[2] / "db" / "applicant_edit.sqlite3"
SCHEMA_PATH = Path(__file__).resolve().parents[2] / "db" / "schema.sql"
AUDIT_TIMEZONE = ZoneInfo("Asia/Bangkok")


class ApplicantService:
    """Read and atomically update applicants with audit records."""

    def __init__(self, database_path: Path = DATABASE_PATH) -> None:
        self.database_path = database_path

    def initialize(self) -> None:
        """Create the shared applicant and audit schema for FR-REG-01."""

        with sqlite3.connect(self.database_path) as connection:
            connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    def get_for_edit(self, applicant_id: str) -> dict[str, object] | None:
        """Return the existing applicant details for FR-REG-01."""

        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                """
                SELECT applicant_id, full_name, phone_number, email, address,
                       status, updated_at
                FROM applicants
                WHERE applicant_id = ?
                """,
                (applicant_id,),
            ).fetchone()
        return dict(row) if row is not None else None

    def cancel_edit(self, applicant_id: str) -> dict[str, object] | None:
        """Return the unchanged applicant without persistence for FR-REG-06."""

        return self.get_for_edit(applicant_id)

    def update(self, applicant_id: str, payload: dict[str, str], editor_user_id: str) -> dict[str, object] | None:
        """Update Applicant and AuditLog in one DOM-TXN-01 transaction."""

        validation_errors = validate_applicant_payload(payload)
        if validation_errors:
            raise ValueError(validation_errors)

        changes = editable_changes(payload)
        edited_at = datetime.now(AUDIT_TIMEZONE).isoformat()
        audit_rows: list[dict[str, str]] = []

        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            with transaction(connection):
                current = connection.execute(
                    """
                    SELECT applicant_id, full_name, phone_number, email, address,
                           status, updated_at
                    FROM applicants
                    WHERE applicant_id = ?
                    """,
                    (applicant_id,),
                ).fetchone()
                if current is None:
                    return None

                changed = {
                    field: value
                    for field, value in changes.items()
                    if value != current[field]
                }
                if changed:
                    assignments = ", ".join(f"{field} = ?" for field in changed)
                    connection.execute(
                        f"""
                        UPDATE applicants
                        SET {assignments}, updated_at = ?
                        WHERE applicant_id = ?
                        """,
                        [*changed.values(), edited_at, applicant_id],
                    )

                    for field, new_value in changed.items():
                        old_value = str(current[field])
                        audit = {
                            "audit_id": str(uuid.uuid4()),
                            "applicant_id": applicant_id,
                            "editor_user_id": editor_user_id,
                            "edited_at": edited_at,
                            "field_name": field,
                            "old_value": old_value,
                            "new_value": new_value,
                            "change_summary": f"{field} changed",
                        }
                        connection.execute(
                            """
                            INSERT INTO applicant_audit_logs (
                                audit_id, applicant_id, editor_user_id, edited_at,
                                field_name, old_value, new_value, change_summary
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            tuple(audit.values()),
                        )
                        audit_rows.append(audit)

                updated = connection.execute(
                    """
                    SELECT applicant_id, full_name, phone_number, email, address,
                           status, updated_at
                    FROM applicants
                    WHERE applicant_id = ?
                    """,
                    (applicant_id,),
                ).fetchone()

        return {"applicant": dict(updated), "audit_log": audit_rows}
