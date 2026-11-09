"""Applicant model shared by applicant registration and editing features."""

from dataclasses import dataclass

# รองรับ: FR-REG-01, FR-REG-04, FR-REG-05, FR-SEL-01, CON-SEL-02, CON-SEL-03


@dataclass
class Applicant:
    """Applicant data with editable contact fields for SPEC-REG-002."""

    applicant_id: str
    full_name: str
    registration_timestamp: str
    eligibility_status: str = "eligible"
    selection_status: str = "pending"
    is_valid_data: bool = True
    created_at: str | None = None
    phone_number: str = ""
    email: str = ""
    address: str = ""
    status: str = "pending"
    updated_at: str | None = None

    def __post_init__(self) -> None:
        if not self.applicant_id or not self.full_name or not self.registration_timestamp:
            raise ValueError("applicant_id, full_name and registration_timestamp are required")
        if self.eligibility_status not in {"eligible", "ineligible", "pending"}:
            raise ValueError("eligibility_status must be eligible, ineligible, or pending")
        if self.selection_status not in {"pending", "selected", "rejected"}:
            raise ValueError("selection_status must be pending, selected, or rejected")

    def is_eligible(self) -> bool:
        return self.is_valid_data and self.eligibility_status == "eligible"
