import logging

import pytest

from backend.app.models.user_account import UserAccount
from backend.app.services.authentication_service import (
    InvalidCredentialsError,
    UnauthorizedAccountError,
    authenticate_user,
    hash_password,
    verify_password,
)


class _FakeCursor:
    def __init__(self, row: tuple[str, str, str, str] | None) -> None:
        self.row = row
        self.query = ""
        self.parameters: tuple[str, ...] = ()

    def __enter__(self) -> "_FakeCursor":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str, parameters: tuple[str, ...]) -> None:
        self.query = query
        self.parameters = parameters

    def fetchone(self):
        return self.row


class _FakeConnection:
    def __init__(self, row: tuple[str, str, str, str] | None) -> None:
        self.cursor_instance = _FakeCursor(row)

    def cursor(self) -> _FakeCursor:
        return self.cursor_instance


# รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-02, ASM-LOG-03 และ Security ใน spec
def test_login_authentication_service(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.DEBUG, logger="backend.app.services.authentication_service")
    password = "test-password-not-for-logs"
    password_hash = hash_password(password)
    assert password_hash.startswith("pbkdf2_sha256$")
    assert password not in password_hash
    assert verify_password(password, password_hash)
    assert not verify_password("wrong-password", password_hash)
    assert not verify_password(password, "malformed-hash")

    for role in ("student", "committee", "faculty"):
        row = ("active-user", password_hash, "active", role)
        account = authenticate_user(_FakeConnection(row), "active-user", password)
        assert isinstance(account, UserAccount)
        assert account.role == role

    with pytest.raises(InvalidCredentialsError):
        authenticate_user(_FakeConnection(None), "missing-user", password)
    with pytest.raises(InvalidCredentialsError):
        authenticate_user(
            _FakeConnection(("active-user", password_hash, "active", "student")),
            "active-user",
            "wrong-password",
        )
    with pytest.raises(UnauthorizedAccountError):
        authenticate_user(
            _FakeConnection(("suspended-user", password_hash, "suspended", "student")),
            "suspended-user",
            password,
        )
    with pytest.raises(UnauthorizedAccountError):
        authenticate_user(
            _FakeConnection(("other-user", password_hash, "active", "staff")),
            "other-user",
            password,
        )

    query_connection = _FakeConnection(("active-user", password_hash, "active", "student"))
    authenticate_user(query_connection, "active-user'; --", password)
    assert query_connection.cursor_instance.parameters == ("active-user'; --",)
    assert password not in query_connection.cursor_instance.query

    assert password not in caplog.text
