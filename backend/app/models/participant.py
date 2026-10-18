"""Participant model for group/department assignment management."""

from dataclasses import dataclass

# รองรับ: CON-GRP-01, CON-GRP-03, IF-GRP-01, NFR-DATA-01, NFR-SEC-01


@dataclass
class Participant:
    """Selected participant who may be assigned to a single group or department."""

    participant_id: str
    full_name: str
    selection_status: str = "selected"
    current_assignment_id: str | None = None
    assignment_status: str = "pending"
    created_at: str | None = None
    updated_at: str | None = None

    def __post_init__(self) -> None:
        if not self.participant_id or not self.full_name:
            raise ValueError("participant_id and full_name are required")
        if self.selection_status not in {"selected", "not_selected"}:
            raise ValueError("selection_status must be 'selected' or 'not_selected'")
        if self.assignment_status not in {"pending", "assigned"}:
            raise ValueError("assignment_status must be 'pending' or 'assigned'")
        if self.current_assignment_id and self.assignment_status != "assigned":
            raise ValueError("current_assignment_id requires assignment_status='assigned'")
        if self.created_at is None:
            self.created_at = "2026-01-01T00:00:00+07:00"
        if self.updated_at is None:
            self.updated_at = self.created_at

    def assign_to(self, assignment_id: str) -> None:
        self.current_assignment_id = assignment_id
        self.assignment_status = "assigned"
        self.updated_at = "2026-01-01T00:00:00+07:00"
