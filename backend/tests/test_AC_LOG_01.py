from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.middleware.sessions import SessionMiddleware

from backend.app.api.authentication import get_authentication_connection, router
from backend.app.services.authentication_service import hash_password

_TEST_SECRET = "test-only-login-session-secret"
_ROLE_MENUS = {
    "student": ["สมัครค่าย", "ดูค่าย"],
    "committee": ["ล็อก", "ตรวจเอกสาร", "ประกาศค่าย"],
    "faculty": ["ล็อก", "อนุมัติโครงการ"],
}


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


def _client(accounts: dict[str, tuple[str, str, str]]) -> TestClient:
    app = FastAPI()
    app.add_middleware(SessionMiddleware, secret_key=_TEST_SECRET)
    app.include_router(router)
    connection = _FakeConnection(accounts)
    app.dependency_overrides[get_authentication_connection] = lambda: connection
    return TestClient(app)


# รองรับ: FR-LOG-02, FR-LOG-03, FR-LOG-04, FR-LOG-05, AC-LOG-01
def test_AC_LOG_01_login_success_by_role() -> None:
    accounts = {
        role: (hash_password(f"password-{role}"), "active", role)
        for role in _ROLE_MENUS
    }
    client = _client(accounts)

    for role, expected_menu in _ROLE_MENUS.items():
        response = client.post(
            "/login",
            json={"username": role, "password": f"password-{role}"},
        )
        assert response.status_code == 200
        assert response.json() == {
            "username": role,
            "role": role,
            "menu": expected_menu,
            "home_url": "/home",
        }

        home_response = client.get("/home")
        assert home_response.status_code == 200
        assert home_response.json() == {
            "username": role,
            "role": role,
            "menu": expected_menu,
        }
