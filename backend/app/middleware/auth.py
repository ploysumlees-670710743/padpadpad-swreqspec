
"""Authentication dependency boundaries for Enrollment and UC-14."""

from fastapi import HTTPException, Request, status


def get_current_user_id(request: Request) -> str:
    """Read user identity from Starlette's signed session."""

    session = request.scope.get("session")
    user_id = session.get("user_id") if isinstance(session, dict) else None

    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return user_id


def get_current_student_id(request: Request) -> str:
    """Read trusted authenticated identity for UC-14."""

    student_id = getattr(request.state, "student_id", None)

    if not isinstance(student_id, str) or not student_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return student_id
