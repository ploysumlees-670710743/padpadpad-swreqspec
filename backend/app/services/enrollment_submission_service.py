"""Submission validation services for camp enrollment."""

import json
from collections.abc import Mapping
from uuid import uuid4

from psycopg import Connection

from backend.app.config import CampConfigurationError, get_configured_camp_id
from backend.app.services.camp_enrollment_service import get_configured_camp
from backend.app.validators.enrollment_validator import validate_enrollment_form


class CampNotOpenError(Exception):
    """Raised when the configured camp is not accepting submissions."""


class ApplicationDraftNotFoundError(Exception):
    """Raised when the signed-in applicant has no Draft for the configured camp."""


class ApplicationAlreadySubmittedError(Exception):
    """Raised when the signed-in applicant has already submitted to the configured camp."""


class SubmissionValidationError(Exception):
    """Raised when required enrollment form values are not met."""

    def __init__(self, errors: list[dict[str, str]]) -> None:
        self.errors = errors
        super().__init__("Application submission validation failed.")


# รองรับ: FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01
def validate_application_fields(
    connection: Connection,
    form_data: Mapping[str, object],
) -> list[dict[str, str]]:
    """Validate the approved form after confirming the configured camp exists."""
    camp_id = get_configured_camp_id()
    camp = get_configured_camp(connection, camp_id)
    if camp is None:
        raise CampConfigurationError("The configured camp record was not found.")
    return validate_enrollment_form(form_data)


# รองรับ: FR-ENR-03, FR-ENR-04, FR-ENR-05, FR-ENR-06, FR-ENR-07,
# CON-ENR-01, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-REL-01
def submit_application(
    connection: Connection,
    applicant_id: str,
) -> dict[str, object]:
    """Validate and atomically move the configured-camp Draft to a submitted Application."""
    camp_id = get_configured_camp_id()
    camp = get_configured_camp(connection, camp_id)
    if camp is None:
        raise CampConfigurationError("The configured camp record was not found.")
    if camp["status"] != "open":
        raise CampNotOpenError("The configured camp is not open for submissions.")

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
            raise ApplicationAlreadySubmittedError

        cursor.execute(
            """
            SELECT draft_id, form_data_json
            FROM application_drafts
            WHERE applicant_id = %s AND camp_id = %s
            """,
            (applicant_id, camp_id),
        )
        draft_row = cursor.fetchone()
        if draft_row is None:
            raise ApplicationDraftNotFoundError
        draft_id, form_data_json = draft_row

    form_data = (
        json.loads(form_data_json)
        if isinstance(form_data_json, str)
        else form_data_json
    )
    if not isinstance(form_data, dict):
        raise ValueError("Stored Draft form data must be a JSON object.")

    errors = validate_enrollment_form(form_data)
    if errors:
        raise SubmissionValidationError(errors)

    application_id = str(uuid4())
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO applications
                    (application_id, applicant_id, camp_id, form_data_json, status, submitted_at)
                VALUES (%s, %s, %s, %s, 'submitted', CURRENT_TIMESTAMP)
                ON CONFLICT (applicant_id, camp_id) DO NOTHING
                RETURNING application_id
                """,
                (
                    application_id,
                    applicant_id,
                    camp_id,
                    json.dumps(form_data, ensure_ascii=False),
                ),
            )
            if cursor.fetchone() is None:
                raise ApplicationAlreadySubmittedError
            # Keep any legacy attachment rows without retaining a foreign key to the deleted Draft.
            cursor.execute(
                "UPDATE application_documents SET draft_id = NULL WHERE draft_id = %s",
                (draft_id,),
            )
            cursor.execute(
                "DELETE FROM application_drafts WHERE draft_id = %s",
                (draft_id,),
            )

    return {
        "application_id": application_id,
        "camp_id": camp_id,
        "form_data": form_data,
        "status": "submitted",
    }


# รองรับ: FR-ENR-07, NFR-DATA-01, NFR-SEC-01
def get_application(
    connection: Connection,
    applicant_id: str,
    camp_id: str,
    application_id: str,
) -> dict[str, object] | None:
    """Return a submitted application only to its owner in the configured camp."""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT application_id, camp_id, form_data_json, status, submitted_at
            FROM applications
            WHERE application_id = %s AND applicant_id = %s AND camp_id = %s
            """,
            (application_id, applicant_id, camp_id),
        )
        row = cursor.fetchone()

    if row is None:
        return None

    form_data = json.loads(row[2]) if isinstance(row[2], str) else row[2]
    if not isinstance(form_data, dict):
        raise ValueError("Stored application form data must be a JSON object.")

    return {
        "application_id": row[0],
        "camp_id": row[1],
        "form_data": form_data,
        "status": row[3],
        "submitted_at": row[4],
    }
