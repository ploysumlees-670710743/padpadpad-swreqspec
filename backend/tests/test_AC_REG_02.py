import sqlite3
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.applicants import get_applicant_service, router
from backend.app.models.user_account import UserAccount
from backend.app.services.applicant_service import ApplicantService


def _client(database_path: Path) -> TestClient:
    service = ApplicantService(database_path)
    service.initialize()
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            INSERT INTO applicants (
                applicant_id, full_name, phone_number, email, address,
                status, registration_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "app-002",
                "ผู้สมัครตัวอย่าง",
                "0811111111",
                "applicant@example.test",
                "ที่อยู่เดิม",
                "pending",
                "2026-11-09T09:00:00+07:00",
            ),
        )

    app = FastAPI()

    async def attach_editor(request, call_next):
        request.state.user = UserAccount("committee-2", "committee", "กรรมการ")
        return await call_next(request)

    app.middleware("http")(attach_editor)
    app.dependency_overrides[get_applicant_service] = lambda: service
    app.include_router(router)
    return TestClient(app)


# Given: คณะกรรมการอยู่ในหน้าแก้ไขข้อมูล;
# When: ส่งเบอร์โทรศัพท์ไม่ครบ 10 หลัก;
# Then: ระบบแจ้งฟิลด์ที่ผิด ไม่บันทึกข้อมูล และไม่สร้าง Audit Log
def test_AC_REG_02_reject_invalid_phone_and_no_audit(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    validation = client.post(
        "/applicants/app-002/validate",
        json={"phone_number": "08123"},
    )

    assert validation.status_code == 200
    assert validation.json() == {
        "valid": False,
        "errors": {"phone_number": "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"},
    }

    response = client.put(
        "/applicants/app-002",
        json={"phone_number": "08123"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["errors"]["phone_number"]

    with sqlite3.connect(tmp_path / "applicant.sqlite3") as connection:
        applicant = connection.execute(
            "SELECT phone_number FROM applicants WHERE applicant_id = ?",
            ("app-002",),
        ).fetchone()
        audit_count = connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-002",),
        ).fetchone()[0]

    assert applicant[0] == "0811111111"
    assert audit_count == 0


def test_AC_REG_02_invalid_phone_has_field_error_without_success_state() -> None:
    from backend.app.api.applicants import router

    app = FastAPI()

    async def attach_unauthorized_user(request, call_next):
        request.state.user = UserAccount("staff-2", "staff", "เจ้าหน้าที่")
        return await call_next(request)

    app.middleware("http")(attach_unauthorized_user)
    app.include_router(router)

    response = TestClient(app).post(
        "/applicants/app-002/validate",
        json={"phone_number": "08123"},
    )

    assert response.status_code == 403
