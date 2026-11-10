"""Camp model for camp enrollment."""

from dataclasses import dataclass

# รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, CON-ENR-01, ASM-02, ASM-03


@dataclass
class Camp:
    """ข้อมูลค่ายที่เปิดรับสมัครและข้อกำหนดการสมัคร."""

    camp_id: str
    name: str
    status: str = "open"
    open_date: str = ""
    close_date: str = ""
    required_fields_json: str = "[]"
    required_documents_json: str = "[]"
    created_at: str = ""

    def __post_init__(self) -> None:
        if not self.camp_id or not self.name:
            raise ValueError("camp_id and name are required")
        if self.status not in {"open", "closed"}:
            raise ValueError("status must be open or closed")

    def is_open(self) -> bool:
        return self.status == "open"
