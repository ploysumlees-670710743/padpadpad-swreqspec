"""API endpoints for schedule viewing and management."""

from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.middleware.authz import (
    read_schedule_user_permission,
    require_schedule_manage_access,
    require_schedule_view_access,
)
from backend.app.models import UserPermission
from backend.app.services.schedule_service import (
    create_activity as create_schedule_activity,
    delete_activity as delete_schedule_activity,
    get_schedule_for_user,
    patch_activity_checklist as patch_schedule_checklist,
    update_activity as update_schedule_activity,
)

# รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-03, FR-SCH-05, CON-SCH-01, CON-SCH-03, NFR-REL-01

router = APIRouter()


@router.get("/schedule")
def read_schedule(
    permission: UserPermission = Depends(read_schedule_user_permission),
) -> dict[str, object]:
    """Return the camp schedule for users with schedule-view permission (FR-SCH-01, CON-SCH-03)."""
    require_schedule_view_access(permission)
    activities = get_schedule_for_user(user_permission=permission)
    return {
        "project_id": "project-001",
        "activities": [asdict(activity) for activity in activities],
    }


@router.post("/schedule/activities", status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: dict[str, object],
    permission: UserPermission = Depends(read_schedule_user_permission),
) -> dict[str, object]:
    """Create a schedule activity only for users with manage permissions (FR-SCH-01, FR-SCH-02, FR-SCH-03, NFR-SEC-01)."""
    require_schedule_manage_access(permission)
    try:
        activity = create_schedule_activity(payload, project_id="project-001")
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return {"created": True, "activity": asdict(activity)}


@router.put("/schedule/activities/{activity_id}")
def update_activity(
    activity_id: str,
    payload: dict[str, object],
    permission: UserPermission = Depends(read_schedule_user_permission),
) -> dict[str, object]:
    """Update a schedule activity only for users with manage permissions (FR-SCH-01, FR-SCH-02, FR-SCH-03, NFR-SEC-01)."""
    require_schedule_manage_access(permission)
    try:
        activity = update_schedule_activity(activity_id, payload, project_id="project-001")
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return {"updated": True, "activity_id": activity_id, "activity": asdict(activity)}


@router.patch("/schedule/activities/{activity_id}/checklist")
def patch_activity_checklist(
    activity_id: str,
    payload: dict[str, object],
    permission: UserPermission = Depends(read_schedule_user_permission),
) -> dict[str, object]:
    """Patch checklist status only for users with manage permissions (FR-SCH-01, FR-SCH-05, NFR-SEC-01)."""
    require_schedule_manage_access(permission)
    status_value = payload.get("checklist_status")
    try:
        activity = patch_schedule_checklist(activity_id, str(status_value), project_id="project-001")
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return {"updated": True, "activity_id": activity_id, "activity": asdict(activity)}


@router.delete("/schedule/activities/{activity_id}")
def delete_activity(
    activity_id: str,
    permission: UserPermission = Depends(read_schedule_user_permission),
) -> dict[str, object]:
    """Delete a schedule activity only for users with manage permissions (FR-SCH-01, CON-SCH-03, NFR-SEC-01)."""
    require_schedule_manage_access(permission)
    deleted = delete_schedule_activity(activity_id, project_id="project-001")
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity {activity_id} not found.")
    return {"deleted": True, "activity_id": activity_id}
