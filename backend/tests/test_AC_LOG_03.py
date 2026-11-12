from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.middleware.sessions import SessionMiddleware

from backend.app.api.authentication import get_authentication_connection, router
from backend.app.services.authentication_service import hash_password

_TEST_SECRET = "test-only-login-session-secret"


class _FakeCursor:
    def __init__(self, accounts: dict[str, tuple[str, str, str]]) -> None:
        self.accounts = accounts
        self.username = ""

    def __enter__(self) -> "_FakeCursor":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, query: str, parameters: tuple[str, ...]) -> None:
        self.username = parameters[0]

    def fetchone(self):
        account = self.accounts.get(self.username)
        if account is None:
            return None
        password_hash, account_status, role = account
        return self.username, password_hash, account_status, role


class _FakeConnection:
    def __init__(self, accounts: dict[str, tuple[str, str, str]]) -> None:
        self.accounts = accounts

    def cursor(self) -> _FakeCursor:
        return _FakeCursor(self.accounts)


def _client() -> TestClient:
    app = FastAPI()
    app.add_middleware(SessionMiddleware, secret_key=_TEST_SECRET)
    app.include_router(router)
    connection = _FakeConnection({
        "suspended-user": (
            hash_password("suspended-password"),
            "suspended",
            "student",
        ),
        "unsupported-user": (
            hash_password("unsupported-password"),
            "active",
            "administrator",
        ),
    })
    app.dependency_overrides[get_authentication_connection] = lambda: connection
    return TestClient(app)


# รองรับ: FR-LOG-03, FR-LOG-04, FR-LOG-07, AC-LOG-03
def test_AC_LOG_03_unauthorized_account() -> None:
    client = _client()
    attempts = [
        {"username": "suspended-user", "password": "suspended-password"},
        {"username": "unsupported-user", "password": "unsupported-password"},
    ]

    for credentials in attempts:
        response = client.post("/login", json=credentials)
        assert response.status_code == 403
        assert response.json() == {"detail": "Account is not authorized."}
        assert client.get("/home").status_code == 401
