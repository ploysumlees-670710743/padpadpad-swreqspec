"""Authentication dependency boundary for trusted user identities."""

from fastapi import HTTPException, Request, status

# รองรับ: CON-ENR-02, NFR-SEC-01, CON-SCH-03


def bind_session_user(request: Request, user_id: str, role: str | None = None) -> str:
    """Persist the authenticated user and role in the signed session and request state."""
    request.session["user_id"] = user_id
    request.state.user_id = user_id
    if role is not None:
        request.session["role"] = role
        request.state.role = role
    return user_id


def get_current_user_id(request: Request) -> str:
    """Read the signed-session identity and ignore impersonation headers/params (CON-ENR-02, NFR-SEC-01)."""
    session_user_id = request.session.get("user_id") if hasattr(request, "session") else None
    trusted_user_id = getattr(request.state, "user_id", None)
    user_id = session_user_id or trusted_user_id
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user_id


def get_current_student_id(request: Request) -> str:
    """Backwards-compatible alias for student identity resolution (CON-SEC-01)."""
    return get_current_user_id(request)
