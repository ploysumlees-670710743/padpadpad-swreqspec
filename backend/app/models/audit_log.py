"""Audit log model for applicant changes."""

from dataclasses import dataclass


@dataclass(frozen=True)
class AuditLog:
    """One changed applicant field recorded for DOM-AUD-01 and FR-REG-05."""

    audit_id: str
    applicant_id: str
    editor_user_id: str
    edited_at: str
    field_name: str
    old_value: str
    new_value: str
    change_summary: str

    def __post_init__(self) -> None:
        required_fields = {
            "audit_id": self.audit_id,
            "applicant_id": self.applicant_id,
            "editor_user_id": self.editor_user_id,
            "edited_at": self.edited_at,
            "field_name": self.field_name,
            "change_summary": self.change_summary,
        }
        missing = [name for name, value in required_fields.items() if not value]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
