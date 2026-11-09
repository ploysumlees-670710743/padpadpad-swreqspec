from pathlib import Path

from backend.app.models import (
    Application,
    ApplicationDocument,
    ApplicationDraft,
    Camp,
)


def test_enrollment_schema_foundation() -> None:
    camp = Camp(
        camp_id="camp-001",
        name="ค่าย AI สำหรับนักศึกษา",
        status="open",
        required_fields_json=(
            '["full_name","nickname","student_id","year_level","phone_number",'
            '"contact_channel","food_allergy"]'
        ),
        required_documents_json="[]",
    )
    draft = ApplicationDraft(
        draft_id="draft-001",
        applicant_id="user-001",
        camp_id="camp-001",
        form_data_json='{"full_name":"นักศึกษา A"}',
        last_saved_at="2569-09-20T08:00:00Z",
    )
    application = Application(
        application_id="app-001",
        applicant_id="user-001",
        camp_id="camp-001",
        status="submitted",
        submitted_at="2569-09-21T08:00:00Z",
    )
    document = ApplicationDocument(
        document_id="doc-001",
        document_type="student_id_card",
        file_name="student_card.pdf",
        file_content=b"pdf-bytes",
        validation_status="pending",
        draft_id="draft-001",
    )

    assert camp.is_open() is True
    assert '"food_allergy"' in camp.required_fields_json
    assert camp.required_documents_json == "[]"
    assert draft.camp_id == "camp-001"
    assert application.is_submitted() is True
    assert document.is_valid() is False
    assert document.file_content == b"pdf-bytes"

    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS camps" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS applications" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS application_drafts" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS application_documents" in schema_sql
    assert "UNIQUE (applicant_id, camp_id)" in schema_sql
    assert "file_content BYTEA" in schema_sql

    seed_path = Path(__file__).resolve().parents[1] / "db" / "seed_campenroll.sql"
    seed_sql = seed_path.read_text(encoding="utf-8")
    assert "INSERT INTO camps" in seed_sql
    assert "camp-001" in seed_sql
    assert "'open'" in seed_sql
    assert '"food_allergy"' in seed_sql
    assert "'[]'" in seed_sql
