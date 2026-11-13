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
"""Authorization dependencies for applicant editing and UC-08 voting."""

from fastapi import HTTPException, Request, status

from backend.app.models.user_account import UserAccount


def get_current_editor(request: Request) -> UserAccount:
    """Allow committee/admin editors to access applicant-edit routes; fail closed otherwise."""
    user = getattr(request.state, "user", None)
    if isinstance(user, UserAccount):
        if user.role not in {"committee", "admin"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit applicants.",
            )
        return user

    user_id = getattr(request.state, "user_id", None)
    role = getattr(request.state, "role", None)
    if isinstance(user_id, str) and user_id and isinstance(role, str) and role in {"committee", "admin"}:
        return UserAccount(user_id=user_id, role=role, display_name=role)

    if user_id is not None or role is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit applicants.",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
    )


def get_authenticated_voter_id(request: Request) -> str:
    """Read trusted authenticated identity and fail closed (FR-VOT-02, CON-SEC-01)."""

    user_id = getattr(request.state, "user_id", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ระบบยืนยันตัวตนขัดข้อง",
        )
    return user_id
