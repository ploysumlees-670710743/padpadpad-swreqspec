from pathlib import Path

from backend.app.models.applicant import Applicant
from backend.app.models.selection_batch import SelectionBatch


def test_selection_t01_models_and_schema_define_applicant_and_batch() -> None:
    applicant = Applicant(
        applicant_id="app-001",
        full_name="นางสาว A",
        registration_timestamp="2026-09-01T09:00:00Z",
        eligibility_status="eligible",
        selection_status="pending",
        is_valid_data=True,
        created_at="2026-09-01T09:00:01Z",
    )
    batch = SelectionBatch(
        batch_id="batch-001",
        requested_quota=150,
        actual_selected_count=0,
        max_quota=150,
        created_by="committee-01",
        created_at="2026-09-01T09:05:00Z",
        status="draft",
    )

    assert applicant.is_eligible() is True
    assert applicant.selection_status == "pending"
    assert batch.max_quota == 150
    assert batch.requested_quota <= batch.max_quota

    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS applicants" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS selection_batches" in schema_sql
    assert "CREATE TABLE IF NOT EXISTS selection_audit_logs" in schema_sql
