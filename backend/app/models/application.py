"""Application model for submitted camp applications."""

from dataclasses import dataclass

# รองรับ: FR-ENR-06, FR-ENR-07, ASM-04, ASM-05


@dataclass
class Application:
    """ใบสมัครที่นักศึกษาส่งแล้วและอยู่ในสถานะรอตรวจสอบ."""

    application_id: str
    applicant_id: str
    camp_id: str
    status: str = "submitted"
    form_data_json: str = "{}"
    submitted_at: str = ""
    created_at: str = ""
    updated_at: str = ""

    def __post_init__(self) -> None:
        if not self.application_id or not self.applicant_id or not self.camp_id:
            raise ValueError("application_id, applicant_id and camp_id are required")
        if self.status not in {"submitted", "reviewed", "rejected"}:
            raise ValueError("status must be submitted, reviewed or rejected")

    def is_submitted(self) -> bool:
        return self.status == "submitted"
