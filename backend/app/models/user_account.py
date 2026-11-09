"""User account model for authentication and role authorization."""

from dataclasses import dataclass


# รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-01, ASM-LOG-02, ASM-LOG-03
@dataclass(frozen=True)
class UserAccount:
    """บัญชีผู้ใช้ที่เก็บรหัสผ่านในรูป hash เท่านั้น."""

    username: str
    password_hash: str
    status: str
    role: str

    def __post_init__(self) -> None:
        if not self.username or not self.password_hash or not self.role:
            raise ValueError("username, password_hash and role are required")
        if self.status not in {"active", "suspended"}:
            raise ValueError("status must be active or suspended")
