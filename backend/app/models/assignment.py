"""Assignment model for group/department management."""

from dataclasses import dataclass

# รองรับ: FR-GRP-03, IF-GRP-02, NFR-DATA-01


@dataclass
class Assignment:
    """Available group or department a participant can be assigned to."""

    assignment_id: str
    assignment_name: str
    assignment_type: str
    is_active: bool = True
    created_at: str | None = None

    def __post_init__(self) -> None:
        if not self.assignment_id or not self.assignment_name:
            raise ValueError("assignment_id and assignment_name are required")
        if self.assignment_type not in {"group", "department"}:
            raise ValueError("assignment_type must be 'group' or 'department'")
        if self.created_at is None:
            self.created_at = "2026-01-01T00:00:00+07:00"
