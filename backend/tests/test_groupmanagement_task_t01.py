from pathlib import Path

from backend.app.models import Assignment, Participant


def test_t01_group_management_models_and_schema_define_selection_and_assignment_basics() -> None:
    participant = Participant(
        participant_id="p-001",
        full_name="นางสาวสมใจ ใจดี",
        selection_status="selected",
        assignment_status="pending",
    )
    assignment = Assignment(
        assignment_id="a-001",
        assignment_name="ฝ่ายสวัสดิการ",
        assignment_type="department",
    )

    assert participant.selection_status == "selected"
    assert participant.assignment_status == "pending"
    assert participant.current_assignment_id is None
    assert assignment.assignment_type == "department"
    assert assignment.is_active is True

    participant.assign_to("a-001")
    assert participant.current_assignment_id == "a-001"
    assert participant.assignment_status == "assigned"

    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS assignments" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS participants" in schema_sql
    assert "selection_status" in schema_sql
    assert "assignment_status" in schema_sql
