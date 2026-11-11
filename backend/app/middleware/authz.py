"""Authorization dependencies for UC-08 voting."""

from fastapi import HTTPException, Request, status
from backend.app.models.user_account import UserAccount


def get_authenticated_voter_id(request: Request) -> str:
    """Read trusted authenticated identity and fail closed (FR-VOT-02, CON-SEC-01)."""

    user_id = getattr(request.state, "user_id", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ระบบยืนยันตัวตนขัดข้อง",
        )
    return user_id

def get_current_editor(request: Request) -> UserAccount:
    """Allow only authenticated committee and admin users to edit applicants."""

    user = getattr(request.state, "user", None)

    if not isinstance(user, UserAccount):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    if user.role not in {"committee", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    return user
