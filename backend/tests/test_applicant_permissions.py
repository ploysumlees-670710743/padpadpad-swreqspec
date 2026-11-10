from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.applicants import router
from backend.app.middleware.authz import get_current_editor
from backend.app.models.user_account import UserAccount


def _client_for_user(user: UserAccount | None) -> TestClient:
    app = FastAPI()

    async def attach_user(request, call_next):
        request.state.user = user
        return await call_next(request)

    app.middleware("http")(attach_user)
    app.include_router(router)
    return TestClient(app)


# Given: ผู้ใช้ที่ยืนยันตัวตนแล้วมีบทบาท committee หรือ admin;
# When: เปิด route แก้ไขข้อมูลผู้สมัคร;
# Then: ระบบต้องอนุญาตให้เข้าถึงโครง route ได้ แม้ผู้สมัครตัวอย่างจะไม่มีอยู่จริง
def test_authorized_applicant_roles_can_access_edit_route() -> None:
    for role in ("committee", "admin"):
        response = _client_for_user(
            UserAccount(user_id=f"{role}-1", role=role, display_name=role)
        ).get("/applicants/app-1/edit")

        assert response.status_code == 404
        assert response.json()["detail"] == "Applicant not found"


# Given: ผู้ใช้ไม่มีบทบาทที่ SEC-RBAC-01 อนุญาต;
# When: เปิด route แก้ไขข้อมูลผู้สมัคร;
# Then: ระบบต้องปฏิเสธการเข้าถึง
def test_unauthorized_applicant_role_is_forbidden() -> None:
    response = _client_for_user(
        UserAccount(user_id="staff-1", role="staff", display_name="staff")
    ).get("/applicants/app-1/edit")

    assert response.status_code == 403


# Given: request ไม่มี identity ที่ยืนยันแล้ว;
# When: เปิด route แก้ไขข้อมูลผู้สมัคร;
# Then: ระบบต้องปฏิเสธคำขอโดยไม่เดาสิทธิ์
def test_missing_identity_is_unauthorized() -> None:
    response = _client_for_user(None).get("/applicants/app-1/edit")

    assert response.status_code == 401


def test_unauthorized_applicant_role_cannot_cancel_edit() -> None:
    response = _client_for_user(
        UserAccount(user_id="staff-1", role="staff", display_name="staff")
    ).post("/applicants/app-1/cancel-edit")

    assert response.status_code == 403
