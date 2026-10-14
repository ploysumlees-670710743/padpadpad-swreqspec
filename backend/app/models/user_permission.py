"""User permission model for schedule management."""

from dataclasses import dataclass

# รองรับ: CON-SCH-03, NFR-SEC-01


@dataclass
class UserPermission:
    """Permission flags for schedule management access."""

    user_id: str
    role: str
    can_view_schedule: bool = False
    can_manage_schedule: bool = False

    def __post_init__(self) -> None:
        if not self.user_id or not self.role:
            raise ValueError("user_id and role are required")
        if self.role not in {"committee", "faculty", "staff"}:
            raise ValueError("role must be committee, faculty, or staff")

    def can_edit_schedule(self) -> bool:
        return self.can_manage_schedule
