"""Applicant editing persistence service."""

import sqlite3
import uuid
from calendar import monthrange
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
AUDIT_RETENTION_MONTHS = 3


def _add_months(value: datetime, months: int) -> datetime:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


class ApplicantService:
    """Read and atomically update applicants with audit records."""

    def __init__(self, database_path: Path = DATABASE_PATH) -> None:
        self.database_path = database_path

    def initialize(self) -> None:
        """Create the shared applicant and audit schema for FR-REG-01."""

        with sqlite3.connect(self.database_path) as connection:
            tables = {
                row[0]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master WHERE type = 'table'"
                )
            }
            if "applicants" not in tables or "applicant_audit_logs" not in tables:
                connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

            columns = {
                row[1]
                for row in connection.execute(
                    "PRAGMA table_info(applicant_audit_logs)"
                )
            }
            if "applicant_id" not in columns:
                connection.execute(
                    """
                    ALTER TABLE applicant_audit_logs
                    ADD COLUMN applicant_id TEXT NOT NULL DEFAULT ''
                    """
                )
            if "retention_until" not in columns:
                connection.execute(
                    """
                    ALTER TABLE applicant_audit_logs
                    ADD COLUMN retention_until TEXT NOT NULL DEFAULT ''
                    """
                )
                existing_logs = connection.execute(
                    "SELECT audit_id, edited_at FROM applicant_audit_logs"
                ).fetchall()
                for audit_id, edited_at in existing_logs:
                    edited_at_value = datetime.fromisoformat(edited_at)
                    retention_until = _add_months(
                        edited_at_value, AUDIT_RETENTION_MONTHS
                    ).isoformat()
                    connection.execute(
                        """
                        UPDATE applicant_audit_logs
                        SET retention_until = ?
                        WHERE audit_id = ?
                        """,
                        (retention_until, audit_id),
                    )
                connection.commit()

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

    def search(self, query: str) -> list[dict[str, object]]:
        """Find applicants by identifier or name for FR-REG-01."""

        pattern = f"%{query}%"
        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                """
                SELECT applicant_id, full_name, phone_number, email, address,
                       status, updated_at
                FROM applicants
                WHERE applicant_id LIKE ? OR full_name LIKE ?
                ORDER BY applicant_id
                """,
                (pattern, pattern),
            ).fetchall()
        return [dict(row) for row in rows]

    def get_audit_log(self, applicant_id: str) -> list[dict[str, object]]:
        """Return audit records in edit order for DOM-AUD-01."""

        with sqlite3.connect(self.database_path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                """
                SELECT audit_id, applicant_id, editor_user_id, edited_at,
                       field_name, old_value, new_value, change_summary,
                       retention_until
                FROM applicant_audit_logs
                WHERE applicant_id = ?
                ORDER BY edited_at ASC, audit_id ASC
                """,
                (applicant_id,),
            ).fetchall()
        return [dict(row) for row in rows]

    def update(self, applicant_id: str, payload: dict[str, str], editor_user_id: str) -> dict[str, object] | None:
        """Update Applicant and AuditLog in one DOM-TXN-01 transaction."""

        validation_errors = validate_applicant_payload(payload)
        if validation_errors:
            raise ValueError(validation_errors)

        changes = editable_changes(payload)
        edited_at_value = datetime.now(AUDIT_TIMEZONE)
        edited_at = edited_at_value.isoformat()
        retention_until = _add_months(
            edited_at_value, AUDIT_RETENTION_MONTHS
        ).isoformat()
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
                if current["status"] == "completed":
                    raise ValueError({"status": "แก้ไขไม่ได้หลังลงทะเบียนเสร็จสิ้น"})

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
                            "retention_until": retention_until,
                        }
                        connection.execute(
                            """
                            INSERT INTO applicant_audit_logs (
                                audit_id, applicant_id, editor_user_id, edited_at,
                                field_name, old_value, new_value, change_summary,
                                retention_until
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
