"""Schedule service for retrieving and mutating camp activities."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from backend.app.db.transaction import transaction
from backend.app.models import SubActivity, UserPermission
from backend.app.validators.activity_validator import (
    validate_activity_payload,
    validate_checklist_status,
)

# รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-03, FR-SCH-05, CON-SCH-01, CON-SCH-03, NFR-REL-01
_DEFAULT_PROJECT_ID = "project-001"
_SCHEDULE_STORE: dict[str, list[SubActivity]] = {
    _DEFAULT_PROJECT_ID: [
        SubActivity(
            activity_id="act-101",
            project_id=_DEFAULT_PROJECT_ID,
            location_id="loc-001",
            activity_name="พิธีเปิด",
            activity_date="2026-01-10",
            start_time="09:00",
            end_time="10:00",
            description="พิธีเปิดกิจกรรมค่าย",
            facilitator_or_responsible="อาจารย์สมชาย",
        ),
        SubActivity(
            activity_id="act-102",
            project_id=_DEFAULT_PROJECT_ID,
            location_id="loc-002",
            activity_name="อบรมความปลอดภัย",
            activity_date="2026-01-10",
            start_time="10:30",
            end_time="11:30",
            description="กิจกรรมอบรมความปลอดภัย",
            facilitator_or_responsible="เจ้าหน้าที่ด้านความปลอดภัย",
        ),
    ]
}


def seed_schedule(project_id: str, activities: Iterable[SubActivity]) -> None:
    """Replace the in-memory schedule data for the project (FR-SCH-01)."""
    _SCHEDULE_STORE[project_id] = list(activities)


def _coerce_permission(
    user_permission: UserPermission | dict[str, Any] | None,
) -> UserPermission | None:
    if user_permission is None:
        return None
    if isinstance(user_permission, UserPermission):
        return user_permission
    if isinstance(user_permission, dict):
        role = str(user_permission.get("role", "staff"))
        return UserPermission(
            user_id=str(user_permission.get("user_id", "unknown-user")),
            role=role,
            can_view_schedule=bool(user_permission.get("can_view_schedule", False)),
            can_manage_schedule=bool(user_permission.get("can_manage_schedule", False)),
        )
    return None


def _activity_overlaps(first: SubActivity, second: SubActivity) -> bool:
    """Check whether two activities overlap in date, time, and location (CON-SCH-01)."""
    if first.location_id != second.location_id or first.activity_date != second.activity_date:
        return False
    return not (first.end_time <= second.start_time or second.end_time <= first.start_time)


def _require_unique_schedule_slot(project_id: str, candidate: SubActivity, exclude_activity_id: str | None = None) -> None:
    """Reject overlapped activities to enforce schedule integrity (FR-SCH-03, CON-SCH-01)."""
    for existing in _SCHEDULE_STORE.get(project_id, []):
        if exclude_activity_id and existing.activity_id == exclude_activity_id:
            continue
        if _activity_overlaps(candidate, existing):
            raise ValueError("Activity overlaps with an existing schedule entry in the same location and time window.")


def can_manage_schedule(user_permission: UserPermission | dict[str, Any] | None) -> bool:
    """Return whether the caller is allowed to manage activities (CON-SCH-03, NFR-SEC-01)."""
    permission = _coerce_permission(user_permission)
    return bool(permission and permission.can_manage_schedule)


def get_schedule_for_user(
    project_id: str = _DEFAULT_PROJECT_ID,
    user_permission: UserPermission | dict[str, Any] | None = None,
) -> list[SubActivity]:
    """Return the schedule only for users that can view it (FR-SCH-01, CON-SCH-03)."""
    permission = _coerce_permission(user_permission)
    if permission is None or not permission.can_view_schedule:
        raise PermissionError("User does not have schedule view permission.")
    return list(_SCHEDULE_STORE.get(project_id, []))


def create_activity(
    payload: dict[str, Any],
    project_id: str = _DEFAULT_PROJECT_ID,
) -> SubActivity:
    """Create a new schedule activity and enforce overlap checks (FR-SCH-02, FR-SCH-03, FR-SCH-05, CON-SCH-01)."""
    with transaction() as tx:
        normalized = validate_activity_payload(payload)
        activities = _SCHEDULE_STORE.setdefault(project_id, [])
        original_activities = list(activities)
        tx.register_undo(lambda: _SCHEDULE_STORE.__setitem__(project_id, original_activities))

        activity = SubActivity(
            activity_id=str(normalized.get("activity_id") or f"act-{len(activities) + 1}"),
            project_id=str(normalized["project_id"]),
            location_id=str(normalized["location_id"]),
            activity_name=str(normalized["activity_name"]),
            activity_date=str(normalized["activity_date"]),
            start_time=str(normalized["start_time"]),
            end_time=str(normalized["end_time"]),
            description=str(normalized["description"]),
            facilitator_or_responsible=str(normalized["facilitator_or_responsible"]),
            checklist_status="Pending",
        )
        _require_unique_schedule_slot(project_id, activity)
        activities.append(activity)
        return activity


def update_activity(
    activity_id: str,
    payload: dict[str, Any],
    project_id: str = _DEFAULT_PROJECT_ID,
) -> SubActivity:
    """Update an activity while preserving schedule uniqueness rules (FR-SCH-01, FR-SCH-02, FR-SCH-03, CON-SCH-01)."""
    with transaction() as tx:
        normalized = validate_activity_payload(payload)
        activities = _SCHEDULE_STORE.setdefault(project_id, [])
        original_activities = list(activities)
        tx.register_undo(lambda: _SCHEDULE_STORE.__setitem__(project_id, original_activities))

        index = next((idx for idx, item in enumerate(activities) if item.activity_id == activity_id), None)
        if index is None:
            raise KeyError(f"Activity {activity_id} not found.")

        existing = activities[index]
        updated = SubActivity(
            activity_id=activity_id,
            project_id=str(normalized["project_id"]),
            location_id=str(normalized["location_id"]),
            activity_name=str(normalized["activity_name"]),
            activity_date=str(normalized["activity_date"]),
            start_time=str(normalized["start_time"]),
            end_time=str(normalized["end_time"]),
            description=str(normalized["description"]),
            facilitator_or_responsible=str(normalized["facilitator_or_responsible"]),
            checklist_status=existing.checklist_status,
        )
        if existing.location_id == updated.location_id and existing.activity_date == updated.activity_date and _activity_overlaps(existing, updated):
            raise ValueError("Activity overlaps with an existing schedule entry in the same location and time window.")
        _require_unique_schedule_slot(project_id, updated, exclude_activity_id=activity_id)
        activities[index] = updated
        return updated


def patch_activity_checklist(
    activity_id: str,
    status: str,
    project_id: str = _DEFAULT_PROJECT_ID,
) -> SubActivity:
    """Toggle a checklist item to Done/Pending through the activity API (FR-SCH-01, FR-SCH-05)."""
    with transaction() as tx:
        validated_status = validate_checklist_status(status)
        activities = _SCHEDULE_STORE.setdefault(project_id, [])
        original_activities = list(activities)
        tx.register_undo(lambda: _SCHEDULE_STORE.__setitem__(project_id, original_activities))

        for index, activity in enumerate(activities):
            if activity.activity_id == activity_id:
                activities[index].checklist_status = validated_status
                return activities[index]
        raise KeyError(f"Activity {activity_id} not found.")


def delete_activity(activity_id: str, project_id: str = _DEFAULT_PROJECT_ID) -> bool:
    """Delete an activity when it exists (FR-SCH-01, CON-SCH-03)."""
    with transaction() as tx:
        activities = _SCHEDULE_STORE.setdefault(project_id, [])
        original_activities = list(activities)
        tx.register_undo(lambda: _SCHEDULE_STORE.__setitem__(project_id, original_activities))

        for index, activity in enumerate(activities):
            if activity.activity_id == activity_id:
                del activities[index]
                return True
        return False
