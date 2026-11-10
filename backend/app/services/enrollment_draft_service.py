"""Persistence services for owner-scoped enrollment Drafts."""

import json
from uuid import uuid4

from psycopg import Connection


# รองรับ: CON-ENR-02, NFR-SEC-01, ASM-09
class DraftAlreadySubmittedError(Exception):
    """Raised when an owner attempts to modify a Draft after submitting an application."""


def save_draft(
    connection: Connection,
    applicant_id: str,
    camp_id: str,
    form_data: dict[str, object],
) -> dict[str, object]:
    """Upsert partial form data under the session owner (FR-ENR-02, CON-ENR-02, ASM-09)."""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT application_id
            FROM applications
            WHERE applicant_id = %s AND camp_id = %s
            """,
            (applicant_id, camp_id),
        )
        if cursor.fetchone() is not None:
            raise DraftAlreadySubmittedError

        cursor.execute(
            """
            INSERT INTO application_drafts
                (draft_id, applicant_id, camp_id, form_data_json)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (applicant_id, camp_id)
            DO UPDATE SET
                form_data_json = EXCLUDED.form_data_json,
                last_saved_at = CURRENT_TIMESTAMP
            RETURNING draft_id, last_saved_at
            """,
            (str(uuid4()), applicant_id, camp_id, json.dumps(form_data, ensure_ascii=False)),
        )
        draft_row = cursor.fetchone()
        if draft_row is None:
            raise RuntimeError("Draft upsert did not return its persisted row.")
        draft_id, last_saved_at = draft_row

    return {
        "draft_id": draft_id,
        "camp_id": camp_id,
        "form_data": form_data,
        "last_saved_at": last_saved_at,
    }


def get_draft(
    connection: Connection,
    applicant_id: str,
    camp_id: str,
) -> dict[str, object] | None:
    """Load form data only for its owner and camp (FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09)."""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT draft_id, form_data_json, last_saved_at
            FROM application_drafts
            WHERE applicant_id = %s AND camp_id = %s
            """,
            (applicant_id, camp_id),
        )
        draft_row = cursor.fetchone()
        if draft_row is None:
            return None

        draft_id, form_data_json, last_saved_at = draft_row
    return {
        "draft_id": draft_id,
        "camp_id": camp_id,
        "form_data": _decode_form_data(form_data_json),
        "last_saved_at": last_saved_at,
    }


def _decode_form_data(value: str | dict[str, object]) -> dict[str, object]:
    """Normalize stored Draft form data for the API response (FR-ENR-02, NFR-DATA-01)."""
    data = json.loads(value) if isinstance(value, str) else value
    if not isinstance(data, dict):
        raise ValueError("Stored Draft form data must be a JSON object.")
    return data
