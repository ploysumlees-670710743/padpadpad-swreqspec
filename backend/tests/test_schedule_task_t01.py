from pathlib import Path

from backend.app.models import CampLocation, CampProject, SubActivity, UserPermission


def test_t01_models_and_schema_define_precondition_and_permission() -> None:
    project = CampProject(project_id="proj-001", project_name="ค่ายฯ ภาคฤดูร้อน")
    location = CampLocation(location_id="loc-001", project_id="proj-001", location_name="หอประชุม A")
    activity = SubActivity(
        activity_id="act-001",
        project_id="proj-001",
        location_id="loc-001",
        activity_name="พิธีเปิด",
        activity_date="2026-01-10",
        start_time="09:00",
        end_time="10:00",
        description="พิธีเปิดกิจกรรมค่าย",
        facilitator_or_responsible="อาจารย์สมชาย",
    )
    committee = UserPermission(
        user_id="user-001",
        role="committee",
        can_view_schedule=True,
        can_manage_schedule=True,
    )

    assert project.status == "active"
    assert location.location_name == "หอประชุม A"
    assert activity.checklist_status == "Pending"
    assert committee.can_edit_schedule() is True

    activity.mark_done()
    assert activity.checklist_status == "Done"

    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS camp_projects" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS camp_locations" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS sub_activities" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS user_permissions" in schema_sql
