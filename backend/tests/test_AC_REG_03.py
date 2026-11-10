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
                "app-003",
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
        request.state.user = UserAccount("committee-3", "committee", "กรรมการ")
        return await call_next(request)

    app.middleware("http")(attach_editor)
    app.dependency_overrides[get_applicant_service] = lambda: service
    app.include_router(router)
    return TestClient(app)


# Given: คณะกรรมการเปลี่ยนข้อมูลในฟอร์มแก้ไขแต่ยังไม่ยืนยัน;
# When: กดปุ่ม "ยกเลิก";
# Then: ระบบยกเลิกการเปลี่ยนแปลง แสดงข้อมูลเดิม และไม่มี Audit Log ใหม่
def test_AC_REG_03_cancel_restores_original_state(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    original = client.get("/applicants/app-003/edit")
    assert original.status_code == 200
    original_applicant = original.json()

    response = client.post("/applicants/app-003/cancel-edit")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "cancelled"
    assert body["applicant"] == original_applicant

    with sqlite3.connect(tmp_path / "applicant.sqlite3") as connection:
        audit_count = connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-003",),
        ).fetchone()[0]

    assert audit_count == 0


def test_TC_REG_03_1_cancel_restores_original_and_closes_form(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    original = client.get("/applicants/app-003/edit").json()
    response = client.post("/applicants/app-003/cancel-edit")

    assert response.json()["status"] == "cancelled"
    assert response.json()["applicant"] == original
    with sqlite3.connect(tmp_path / "applicant.sqlite3") as connection:
        assert connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-003",),
        ).fetchone()[0] == 0


def test_TC_REG_03_2_cancel_all_changed_fields(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    original = client.get("/applicants/app-003/edit").json()
    response = client.post("/applicants/app-003/cancel-edit")

    assert response.status_code == 200
    assert response.json()["applicant"] == original
    with sqlite3.connect(tmp_path / "applicant.sqlite3") as connection:
        assert connection.execute(
            "SELECT phone_number, full_name, email, address, status "
            "FROM applicants WHERE applicant_id = ?",
            ("app-003",),
        ).fetchone() == (
            original["phone_number"],
            original["full_name"],
            original["email"],
            original["address"],
            original["status"],
        )


def test_TC_REG_03_3_cancel_without_changes(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    original = client.get("/applicants/app-003/edit").json()
    response = client.post("/applicants/app-003/cancel-edit")

    assert response.status_code == 200
    assert response.json() == {"status": "cancelled", "applicant": original}
    with sqlite3.connect(tmp_path / "applicant.sqlite3") as connection:
        assert connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-003",),
        ).fetchone()[0] == 0
