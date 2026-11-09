"""Authentication dependency boundary for UC-14."""

from fastapi import HTTPException, Request, status


def bind_session_user(
    request: Request,
    user_id: str,
    role: str | None = None,
) -> None:
    """Bind an authenticated identity to the signed session (FR-LOG-03, FR-LOG-04, CON-ENR-02, NFR-SEC-01)."""
    if not isinstance(user_id, str) or not user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    if role is not None:
        if role not in {"student", "committee", "faculty"}:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )
    request.session["user_id"] = user_id
    if role is not None:
        request.session["role"] = role


def get_current_user_id(request: Request) -> str:
    """Read the identity only from the signed session (CON-ENR-02, NFR-SEC-01)."""
    user_id = request.session.get("user_id")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user_id


def get_current_student_id(request: Request) -> str:
    """Read the trusted authenticated identity and fail closed (CON-SEC-01)."""

    student_id = getattr(request.state, "student_id", None)
    if not isinstance(student_id, str) or not student_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return student_id
