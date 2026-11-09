"""Authorization helpers for schedule access and management permissions."""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, Request, status

from backend.app.models import UserPermission

# รองรับ: FR-SCH-01, CON-SCH-03, NFR-SEC-01


def _coerce_permission(permission: UserPermission | dict[str, Any] | None) -> UserPermission | None:
    if permission is None:
        return None
    if isinstance(permission, UserPermission):
        return permission
    if isinstance(permission, dict):
        return UserPermission(
            user_id=str(permission.get("user_id", "unknown-user")),
            role=str(permission.get("role", "staff")),
            can_view_schedule=bool(permission.get("can_view_schedule", False)),
            can_manage_schedule=bool(permission.get("can_manage_schedule", False)),
        )
    return None


def read_schedule_user_permission(request: Request) -> UserPermission:
    """Read the trusted schedule permission state from the request (CON-SCH-03, NFR-SEC-01)."""
    permission = _coerce_permission(getattr(request.state, "user_permission", None))
    if permission is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for schedule access.",
        )
    return permission


def require_schedule_view_access(permission: UserPermission | dict[str, Any] | None) -> UserPermission:
    """Ensure a caller can view the camp schedule (FR-SCH-01, CON-SCH-03)."""
    parsed = _coerce_permission(permission)
    if parsed is None or not parsed.can_view_schedule:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view the schedule.",
        )
    return parsed


def require_schedule_manage_access(permission: UserPermission | dict[str, Any] | None) -> UserPermission:
    """Ensure a caller can modify the camp schedule (FR-SCH-01, CON-SCH-03, NFR-SEC-01)."""
    parsed = _coerce_permission(permission)
    if parsed is None or not parsed.can_manage_schedule:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage the schedule.",
        )
    return parsed
