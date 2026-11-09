"""Authorization dependency for applicant editing endpoints."""

from fastapi import HTTPException, Request, status

from backend.app.models.user_account import UserAccount

EDIT_APPLICANT_ROLES = frozenset({"committee", "admin"})


def get_current_editor(request: Request) -> UserAccount:
    """Allow only committee or admin identities for SEC-RBAC-01 and NFR-SEC-01."""

    user = getattr(request.state, "user", None)
    if not isinstance(user, UserAccount):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    if user.role not in EDIT_APPLICANT_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ไม่มีสิทธิ์แก้ไขข้อมูลผู้สมัคร",
        )
    return user
