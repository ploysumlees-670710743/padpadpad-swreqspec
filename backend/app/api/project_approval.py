"""UC-07 approval API: AC-07, AF-07-01/02, C-01, C-02, QR-01/02."""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from backend.app.services.project_approval_service import (
    ApprovalForbiddenError, ApprovalStateError, ProjectApprovalService,
)

router = APIRouter(prefix="/api/projects", tags=["UC-07 project approval"])


class ApprovalDecision(BaseModel):
    decision: Literal["approved", "rejected", "revision"]
    feedback: str = ""


def get_actor(request: Request) -> tuple[str, str]:
    """C-01: UC-09 session middleware must populate trusted user identity and role."""
    user_id = getattr(request.state, "user_id", None)
    role = getattr(request.state, "role", None)
    if not isinstance(user_id, str) or not user_id or not isinstance(role, str):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    if role not in ("committee", "faculty"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Role not permitted")
    return user_id, role


def get_project_approval_service() -> ProjectApprovalService:
    return ProjectApprovalService()


def _translate_error(error):
    if isinstance(error, ApprovalForbiddenError):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(error))
    if isinstance(error, LookupError):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    return HTTPException(status.HTTP_409_CONFLICT, str(error))


@router.post("/{project_id}/approval/submit", status_code=status.HTTP_201_CREATED)
def submit_project(
    project_id: str,
    actor: tuple[str, str] = Depends(get_actor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
):
    """Submit or resubmit a project after revision (C-02)."""
    if actor[1] != "committee":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Committee role required")
    try:
        return service.submit(project_id, actor[0])
    except (ApprovalForbiddenError, ApprovalStateError, LookupError) as exc:
        raise _translate_error(exc) from None


@router.post("/{project_id}/approval")
def decide_approval(
    project_id: str,
    payload: ApprovalDecision,
    actor: tuple[str, str] = Depends(get_actor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
):
    """AC-07: approval/rejection/revision by an assigned faculty adviser only."""
    if actor[1] != "faculty":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Faculty role required")
    try:
        return service.review(project_id, actor[0], payload.decision, payload.feedback)
    except (ApprovalForbiddenError, ApprovalStateError, LookupError) as exc:
        raise _translate_error(exc) from None


@router.get("/{project_id}/approval")
def get_approval_status(
    project_id: str,
    actor: tuple[str, str] = Depends(get_actor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
):
    """FR-07-05: latest project status and append-only decision history."""
    try:
        result = service.get_status(project_id, actor[0], actor[1])
        # The viewer's role is derived from trusted server authentication, never
        # supplied by the client. The UI may hide actions; API still enforces them.
        return {**result, "viewer_role": actor[1]}
    except (ApprovalForbiddenError, LookupError) as exc:
        raise _translate_error(exc) from None


@router.get("/{project_id}/approval/notifications")
def get_approval_notifications(
    project_id: str,
    actor: tuple[str, str] = Depends(get_actor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
):
    """AC-07: committee notification for latest decisions (in-app only)."""
    if actor[1] != "committee":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Committee role required")
    try:
        return service.get_notifications(project_id, actor[0])
    except (ApprovalForbiddenError, LookupError) as exc:
        raise _translate_error(exc) from None
