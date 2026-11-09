"""Routes for browsing camps open for enrollment."""

from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request, status
from psycopg import Connection
from starlette.responses import JSONResponse

from backend.app.config import CampConfigurationError, get_configured_camp_id
from backend.app.db.database import get_database_connection
from backend.app.middleware.auth import get_current_user_id
from backend.app.services.camp_enrollment_service import get_configured_camp
from backend.app.services.enrollment_draft_service import (
    DraftAlreadySubmittedError,
    get_draft,
    save_draft,
)
from backend.app.services.enrollment_submission_service import (
    ApplicationAlreadySubmittedError,
    ApplicationDraftNotFoundError,
    CampNotOpenError,
    SubmissionValidationError,
    get_application,
    submit_application,
)
from backend.app.validators.enrollment_validator import validate_form_field_names

router = APIRouter()


def get_camp_connection() -> Generator[Connection, None, None]:
    """Provide one PostgreSQL connection for a camp request (FR-ENR-01, CON-ENR-01)."""
    with get_database_connection() as connection:
        yield connection


def _configured_camp_id() -> str:
    """Resolve the single camp from server configuration (FR-ENR-01, CON-ENR-01)."""
    try:
        return get_configured_camp_id()
    except CampConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Configuration Error",
        ) from exc


@router.get("/enrollment/camp")
def read_configured_camp(
    _applicant_id: str = Depends(get_current_user_id),
    connection: Connection = Depends(get_camp_connection),
) -> dict[str, object]:
    """Return the configured camp directly to a signed-in applicant (FR-ENR-01, CON-ENR-01, CON-ENR-02)."""
    camp_id = _configured_camp_id()
    camp = get_configured_camp(connection, camp_id)
    if camp is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Configuration Error",
        )
    return camp


@router.put("/applications/draft", response_model=None)
async def put_draft(
    request: Request,
    applicant_id: str = Depends(get_current_user_id),
    connection: Connection = Depends(get_camp_connection),
) -> dict[str, object] | JSONResponse:
    """Save partial form data to the signed-in owner's Draft (FR-ENR-02, CON-ENR-02, ASM-09)."""
    camp_id = _configured_camp_id()
    try:
        payload = await request.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Draft payload must be valid JSON.",
        ) from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("form_data"), dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Draft payload must contain a form_data object.",
        )
    form_data = payload["form_data"]
    field_errors = validate_form_field_names(form_data)
    if field_errors:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"errors": field_errors},
        )

    try:
        draft = save_draft(connection, applicant_id, camp_id, form_data)
    except DraftAlreadySubmittedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A submitted application already exists for this camp.",
        ) from exc
    return draft


@router.get("/applications/draft")
def read_draft(
    applicant_id: str = Depends(get_current_user_id),
    connection: Connection = Depends(get_camp_connection),
) -> dict[str, object]:
    """Load only the signed-in owner's Draft form data (FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09)."""
    camp_id = _configured_camp_id()
    draft = get_draft(connection, applicant_id, camp_id)
    if draft is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found.")
    return draft


@router.post("/applications/submit", status_code=status.HTTP_201_CREATED)
def post_application(
    applicant_id: str = Depends(get_current_user_id),
    connection: Connection = Depends(get_camp_connection),
) -> JSONResponse:
    """Submit the signed-in owner's configured-camp Draft after server-side validation (FR-ENR-06, FR-ENR-07)."""
    try:
        result = submit_application(connection, applicant_id)
    except CampConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Configuration Error",
        ) from exc
    except CampNotOpenError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The configured camp is not open for submissions.",
        ) from exc
    except ApplicationDraftNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        ) from exc
    except ApplicationAlreadySubmittedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An application has already been submitted for this camp.",
        ) from exc
    except SubmissionValidationError as exc:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"errors": exc.errors},
        )
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=result)


@router.get("/applications/{application_id}")
def read_application(
    application_id: str,
    applicant_id: str = Depends(get_current_user_id),
    connection: Connection = Depends(get_camp_connection),
) -> dict[str, object]:
    """Return saved application data only to its signed-in owner (FR-ENR-07, NFR-DATA-01, NFR-SEC-01)."""
    camp_id = _configured_camp_id()
    application = get_application(connection, applicant_id, camp_id, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )
    return application
