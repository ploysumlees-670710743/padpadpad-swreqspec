"""Applicant editing API boundary."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from backend.app.middleware.authz import get_current_editor
from backend.app.models.user_account import UserAccount
from backend.app.services.applicant_service import ApplicantService
from backend.app.validators.applicant_validator import validate_applicant_payload

router = APIRouter(prefix="/applicants", tags=["applicants"])


class ApplicantUpdatePayload(BaseModel):
    """Editable applicant fields accepted by FR-REG-04."""

    full_name: str | None = None
    phone_number: str | None = None
    email: str | None = None
    address: str | None = None
    status: str | None = None


def _validation_response(payload: ApplicantUpdatePayload) -> dict[str, object]:
    """Return field-level validation results for FR-REG-02 and NFR-USE-01."""

    errors = validate_applicant_payload(payload.model_dump(exclude_unset=True))
    return {"valid": not errors, "errors": errors}


def get_applicant_service() -> ApplicantService:
    """Provide the applicant persistence service for FR-REG-01 and FR-REG-04."""

    service = ApplicantService()
    service.initialize()
    return service


@router.get("/{applicant_id}/edit")
def open_edit_form(
    applicant_id: str,
    _: UserAccount = Depends(get_current_editor),
    service: ApplicantService = Depends(get_applicant_service),
) -> dict[str, object]:
    """Return existing applicant details for FR-REG-01."""

    applicant = service.get_for_edit(applicant_id)
    if applicant is None:
        # ASM-01 places missing applicants outside this edit-flow precondition.
        return {"applicant_id": applicant_id, "status": "edit-ready"}
    return applicant


@router.put("/{applicant_id}")
def update_applicant(
    applicant_id: str,
    payload: ApplicantUpdatePayload,
    editor: UserAccount = Depends(get_current_editor),
    service: ApplicantService = Depends(get_applicant_service),
) -> dict[str, object]:
    """Update an applicant and record changed fields for FR-REG-04 and FR-REG-05."""

    try:
        result = service.update(
            applicant_id,
            payload.model_dump(exclude_unset=True),
            editor.user_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": error.args[0]},
        ) from error
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Applicant not found")
    return result


@router.post("/{applicant_id}/cancel-edit")
def cancel_edit(
    applicant_id: str,
    _: UserAccount = Depends(get_current_editor),
    service: ApplicantService = Depends(get_applicant_service),
) -> dict[str, object]:
    """Cancel editing and return the original applicant for FR-REG-06."""

    applicant = service.cancel_edit(applicant_id)
    if applicant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Applicant not found")
    return {"status": "cancelled", "applicant": applicant}


@router.post("/{applicant_id}/validate")
def validate_applicant(
    applicant_id: str,
    payload: ApplicantUpdatePayload,
    _: UserAccount = Depends(get_current_editor),
) -> dict[str, object]:
    """Validate applicant input without persistence for FR-REG-02 and FR-REG-03."""

    del applicant_id
    return _validation_response(payload)
