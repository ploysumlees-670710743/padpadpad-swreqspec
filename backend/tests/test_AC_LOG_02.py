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
        "student-01": (hash_password("correct-password"), "active", "student"),
    })
    app.dependency_overrides[get_authentication_connection] = lambda: connection
    return TestClient(app)


# รองรับ: FR-LOG-03, FR-LOG-06, AC-LOG-02
def test_AC_LOG_02_invalid_credentials() -> None:
    client = _client()
    attempts = [
        {"username": "student-01", "password": "incorrect-password"},
        {"username": "unknown-user", "password": "any-password"},
    ]

    for credentials in attempts:
        response = client.post("/login", json=credentials)
        assert response.status_code == 401
        assert response.json() == {"detail": "Authentication failed."}
        assert client.get("/home").status_code == 401
