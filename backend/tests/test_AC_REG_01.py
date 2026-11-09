import sqlite3
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

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
                "app-001",
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
        request.state.user = UserAccount("committee-1", "committee", "กรรมการ")
        return await call_next(request)

    app.middleware("http")(attach_editor)
    app.dependency_overrides[get_applicant_service] = lambda: service
    app.include_router(router)
    return TestClient(app)


# Given: คณะกรรมการเปิดหน้าข้อมูลผู้สมัครที่มีเบอร์โทรศัพท์เดิม;
# When: แก้ไขเบอร์โทรศัพท์ติดต่อและกดยืนยัน;
# Then: ระบบบันทึกข้อมูลใหม่และสร้างประวัติที่มีผู้แก้ไข วันเวลา ฟิลด์ ค่าเดิม และค่าใหม่
def test_AC_REG_01_save_edit_and_create_audit_log(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    original = client.get("/applicants/app-001/edit")
    assert original.status_code == 200
    assert original.json()["phone_number"] == "0811111111"

    response = client.put(
        "/applicants/app-001",
        json={"phone_number": "0822222222"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["applicant"]["phone_number"] == "0822222222"
    assert len(body["audit_log"]) == 1
    assert body["audit_log"][0]["editor_user_id"] == "committee-1"
    assert body["audit_log"][0]["field_name"] == "phone_number"
    assert body["audit_log"][0]["old_value"] == "0811111111"
    assert body["audit_log"][0]["new_value"] == "0822222222"
    assert "+07:00" in body["audit_log"][0]["edited_at"]


def test_transaction_rolls_back_applicant_when_audit_insert_fails(tmp_path: Path) -> None:
    database_path = tmp_path / "applicant.sqlite3"
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
                "app-rollback",
                "ผู้สมัครตัวอย่าง",
                "0811111111",
                "applicant@example.test",
                "ที่อยู่เดิม",
                "pending",
                "2026-11-09T09:00:00+07:00",
            ),
        )
        connection.execute(
            """
            CREATE TRIGGER reject_audit_insert
            BEFORE INSERT ON applicant_audit_logs
            BEGIN
                SELECT RAISE(ABORT, 'audit insert failed');
            END
            """
        )

    with pytest.raises(sqlite3.IntegrityError):
        service.update("app-rollback", {"phone_number": "0822222222"}, "committee-1")

    with sqlite3.connect(database_path) as connection:
        applicant_phone = connection.execute(
            "SELECT phone_number FROM applicants WHERE applicant_id = ?",
            ("app-rollback",),
        ).fetchone()[0]
        audit_count = connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-rollback",),
        ).fetchone()[0]

    assert applicant_phone == "0811111111"
    assert audit_count == 0


def test_AC_REG_01_save_with_audit_log_average_response_under_1_5_seconds(
    tmp_path: Path,
) -> None:
    client = _client(tmp_path / "applicant.sqlite3")
    durations = []

    for index in range(10):
        phone_number = f"08{index:08d}"
        started = time.perf_counter()
        response = client.put(
            "/applicants/app-001",
            json={"phone_number": phone_number},
        )
        durations.append(time.perf_counter() - started)
        assert response.status_code == 200

    assert sum(durations) / len(durations) <= 1.5


# Given: คณะกรรมการเปิดหน้าข้อมูลผู้สมัครที่มีเบอร์โทรศัพท์เดิม;
# When: แก้ไขเบอร์โทรศัพท์ติดต่อเป็นเบอร์ใหม่ แล้วกด "ยืนยัน";
# Then: ระบบบันทึกข้อมูลใหม่; สร้างประวัติการเปลี่ยนแปลง;
# ระบุผู้แก้ไข วันเวลา ฟิลด์ เบอร์เดิม และเบอร์ใหม่
def test_TC_REG_01_1_save_phone_and_create_audit_log(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    response = client.put(
        "/applicants/app-001",
        json={"phone_number": "0822222222"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["applicant"]["phone_number"] == "0822222222"
    assert len(body["audit_log"]) == 1
    audit = body["audit_log"][0]
    assert audit["editor_user_id"] == "committee-1"
    assert audit["edited_at"].endswith("+07:00")
    assert audit["field_name"] == "phone_number"
    assert audit["old_value"] == "0811111111"
    assert audit["new_value"] == "0822222222"


# Given: คณะกรรมการเปิดหน้าข้อมูลผู้สมัครที่มีเบอร์โทรศัพท์เดิม;
# When: กดยืนยันโดยส่งเบอร์โทรศัพท์เดิมซ้ำ ไม่ได้เปลี่ยนค่า;
# Then: ระบบบันทึกเฉพาะฟิลด์ที่เปลี่ยนแปลงเท่านั้นตาม ASM-06
# ส่วนการสร้างประวัติเมื่อไม่มีฟิลด์เปลี่ยนแปลง spec ไม่ได้บอก จึงไม่ตรวจส่วนนั้น
def test_TC_REG_01_2_ignore_unchanged_phone(tmp_path: Path) -> None:
    client = _client(tmp_path / "applicant.sqlite3")

    response = client.put(
        "/applicants/app-001",
        json={"phone_number": "0811111111"},
    )

    assert response.status_code == 200
    assert response.json()["applicant"]["phone_number"] == "0811111111"


# Given: ผู้ใช้งานไม่มีบทบาท "คณะกรรมการ" หรือ "ผู้ดูแลระบบ" เปิดหน้าข้อมูลผู้สมัคร;
# When: พยายามแก้ไขเบอร์โทรศัพท์และกด "ยืนยัน";
# Then: ระบบป้องกันไม่ให้ผู้ใช้ที่ไม่มีสิทธิ์เข้าถึงและแก้ไขข้อมูลตาม SEC-RBAC-01;
# ระบบไม่บันทึกข้อมูลใหม่และไม่สร้างประวัติการเปลี่ยนแปลง
def test_TC_REG_01_3_reject_unauthorized_editor(tmp_path: Path) -> None:
    database_path = tmp_path / "applicant.sqlite3"
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
                "app-unauthorized",
                "ผู้สมัครตัวอย่าง",
                "0811111111",
                "applicant@example.test",
                "ที่อยู่เดิม",
                "pending",
                "2026-11-09T09:00:00+07:00",
            ),
        )

    app = FastAPI()

    async def attach_unauthorized_editor(request, call_next):
        request.state.user = UserAccount("staff-1", "staff", "เจ้าหน้าที่")
        return await call_next(request)

    app.middleware("http")(attach_unauthorized_editor)
    app.dependency_overrides[get_applicant_service] = lambda: service
    app.include_router(router)
    client = TestClient(app)

    edit_response = client.get("/applicants/app-unauthorized/edit")
    update_response = client.put(
        "/applicants/app-unauthorized",
        json={"phone_number": "0822222222"},
    )

    assert edit_response.status_code == 403
    assert update_response.status_code == 403
    with sqlite3.connect(database_path) as connection:
        phone_number = connection.execute(
            "SELECT phone_number FROM applicants WHERE applicant_id = ?",
            ("app-unauthorized",),
        ).fetchone()[0]
        audit_count = connection.execute(
            "SELECT COUNT(*) FROM applicant_audit_logs WHERE applicant_id = ?",
            ("app-unauthorized",),
        ).fetchone()[0]
    assert phone_number == "0811111111"
    assert audit_count == 0
