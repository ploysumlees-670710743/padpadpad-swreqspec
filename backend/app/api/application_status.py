"""Application status endpoints for UC-14."""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.middleware.auth import get_current_student_id
from backend.app.models.application_status import ApplicationStatus
from backend.app.services.application_status_service import ApplicationStatusService

router = APIRouter(prefix="/api/applications", tags=["application-status"])


def get_application_status_service() -> ApplicationStatusService:
    """Provide the read-only application status service (FR-STA-01)."""

    return ApplicationStatusService()


@router.get("/me", response_model=list[ApplicationStatus])
def get_my_application(
    student_id: str = Depends(get_current_student_id),
    service: ApplicationStatusService = Depends(get_application_status_service),
) -> list[ApplicationStatus]:
    """Return all application summaries owned by the authenticated student (FR-STA-01)."""

    application = service.get_for_student(student_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    return application


@router.get("/{application_id}", response_model=ApplicationStatus)
def get_application_by_id(
    application_id: str,
    student_id: str = Depends(get_current_student_id),
    service: ApplicationStatusService = Depends(get_application_status_service),
) -> ApplicationStatus:
    """Deny access to another student's application without returning its data (CON-SEC-01)."""

    result = service.get_by_id(application_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    owner_id, application = result
    if owner_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์เข้าถึงข้อมูลใบสมัครนี้",
        )
    return application
