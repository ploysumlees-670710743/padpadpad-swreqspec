import sqlite3

from fastapi.testclient import TestClient

from backend.app.api.application_status import get_application_status_service
from backend.app.main import app
from backend.app.middleware.auth import get_current_student_id
from backend.app.services.application_status_service import ApplicationStatusService


def _create_application(database_path, application_id: str, student_id: str) -> None:
    """Seed the AC-STA-01 scenario with one owned or foreign application."""

    service = ApplicationStatusService(database_path)
    service.initialize()
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            INSERT INTO applications (
                application_id, student_id, application_status, camp_name,
                activity_start_at, activity_end_at, camp_location, preparation_info
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                application_id,
                student_id,
                "ผ่านการคัดเลือก",
                "ค่ายวิทยาศาสตร์",
                "2026-12-01T09:00:00+07:00",
                "2026-12-03T17:00:00+07:00",
                "อาคารกิจกรรม",
                "เตรียมเอกสารประจำตัว",
            ),
        )


def test_AC_STA_01_owner_sees_application_status_and_camp_details(tmp_path) -> None:
    database_path = tmp_path / "applications.sqlite3"
    _create_application(database_path, "app-001", "student-001")
    app.dependency_overrides[get_current_student_id] = lambda: "student-001"
    app.dependency_overrides[get_application_status_service] = lambda: ApplicationStatusService(
        database_path
    )

    try:
        with TestClient(app) as client:
            response = client.get("/api/applications/me")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()[0]
    assert data["status"] == "ผ่านการคัดเลือก"
    assert data["camp_name"] == "ค่ายวิทยาศาสตร์"
    assert data["activity_start_at"] == "2026-12-01T09:00:00+07:00"
    assert data["activity_end_at"] == "2026-12-03T17:00:00+07:00"
    assert data["camp_location"] == "อาคารกิจกรรม"
    assert data["preparation_info"] == "เตรียมเอกสารประจำตัว"


def test_AC_STA_01_non_owner_is_forbidden_without_disclosing_application(
    tmp_path,
) -> None:
    database_path = tmp_path / "applications.sqlite3"
    _create_application(database_path, "app-002", "student-owner")
    app.dependency_overrides[get_current_student_id] = lambda: "student-other"
    app.dependency_overrides[get_application_status_service] = lambda: ApplicationStatusService(
        database_path
    )

    try:
        with TestClient(app) as client:
            response = client.get("/api/applications/app-002")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json() == {"detail": "ไม่มีสิทธิ์เข้าถึงข้อมูลใบสมัครนี้"}
    assert "ค่ายวิทยาศาสตร์" not in response.text
