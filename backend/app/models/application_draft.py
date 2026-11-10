"""Draft model for incomplete applications before submission."""

from dataclasses import dataclass

# รองรับ: FR-ENR-02, CON-ENR-02, ASM-09


@dataclass
class ApplicationDraft:
    """Draft ของการสมัครที่ยังไม่ออกใบสมัครและผูกกับบัญชีและค่าย."""

    draft_id: str
    applicant_id: str
    camp_id: str
    form_data_json: str = "{}"
    last_saved_at: str = ""

    def __post_init__(self) -> None:
        if not self.draft_id or not self.applicant_id or not self.camp_id:
            raise ValueError("draft_id, applicant_id and camp_id are required")
