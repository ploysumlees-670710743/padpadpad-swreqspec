"""Authentication dependency boundary for UC-14."""

from fastapi import HTTPException, Request, status


def get_current_student_id(request: Request) -> str:
    """Read the trusted authenticated identity and fail closed (CON-SEC-01)."""

    student_id = getattr(request.state, "student_id", None)
    if not isinstance(student_id, str) or not student_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return student_id
