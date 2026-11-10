"""Legacy application-document model retained for existing database records."""

from dataclasses import dataclass


# รองรับ: NFR-DATA-01 (คงโครงสร้างข้อมูลเอกสารเดิมไว้; ไม่ใช้ในฟอร์มปัจจุบัน)
@dataclass
class ApplicationDocument:
    """Represent a legacy document row without using it in the current form flow."""

    document_id: str
    document_type: str
    file_name: str
    file_content: bytes = b""
    validation_status: str = "pending"
    draft_id: str | None = None
    application_id: str | None = None
    validated_at: str = ""

    def __post_init__(self) -> None:
        if not self.document_id or not self.document_type or not self.file_name:
            raise ValueError("document_id, document_type and file_name are required")
        if self.validation_status not in {"pending", "valid", "invalid"}:
            raise ValueError("validation_status must be pending, valid or invalid")

    def is_valid(self) -> bool:
        return self.validation_status == "valid"
