"""Login and role-based home APIs."""

from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from psycopg import Connection

from backend.app.db.database import get_database_connection
from backend.app.middleware.auth import bind_session_user
from backend.app.services.authentication_service import (
    InvalidCredentialsError,
    UnauthorizedAccountError,
    authenticate_user,
)

router = APIRouter(tags=["authentication"])

_ROLE_MENUS = {
    "student": ["สมัครค่าย", "ดูค่าย"],
    "committee": ["ล็อก", "ตรวจเอกสาร", "ประกาศค่าย"],
    "faculty": ["ล็อก", "อนุมัติโครงการ"],
}


class LoginRequest(BaseModel):
    """Credentials submitted by the user (FR-LOG-02)."""

    username: str
    password: str


# รองรับ: FR-LOG-02, FR-LOG-03, FR-LOG-04 และ Constraint: ฐานข้อมูลหลัก
def get_authentication_connection() -> Generator[Connection, None, None]:
    """Provide one database connection for a login request."""
    with get_database_connection() as connection:
        yield connection


# รองรับ: FR-LOG-02, FR-LOG-03, FR-LOG-04, FR-LOG-05, AC-LOG-01
@router.post("/login")
def login(
    payload: LoginRequest,
    request: Request,
    connection: Connection = Depends(get_authentication_connection),
) -> dict[str, object]:
    """Authenticate an active account and bind its role to the signed session."""
    try:
        account = authenticate_user(connection, payload.username, payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
        ) from exc
    except UnauthorizedAccountError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not authorized.",
        ) from exc

    bind_session_user(request, account.username, account.role)
    return {
        "username": account.username,
        "role": account.role,
        "menu": _ROLE_MENUS[account.role],
        "home_url": "/home",
    }


# รองรับ: FR-LOG-05, AC-LOG-01
@router.get("/home")
def read_role_home(request: Request) -> dict[str, object]:
    """Return the signed-in user's role menu for the role home page."""
    username = request.session.get("user_id")
    role = request.session.get("role")
    if not isinstance(username, str) or not isinstance(role, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    menu = _ROLE_MENUS.get(role)
    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not authorized.",
        )
    return {"username": username, "role": role, "menu": menu}
