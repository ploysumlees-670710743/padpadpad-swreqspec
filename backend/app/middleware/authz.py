"""Authorization dependencies for UC-08 voting."""

from fastapi import HTTPException, Request, status


def get_authenticated_voter_id(request: Request) -> str:
    """Read trusted authenticated identity and fail closed (FR-VOT-02, CON-SEC-01)."""

    user_id = getattr(request.state, "user_id", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ระบบยืนยันตัวตนขัดข้อง",
        )
    return user_id
