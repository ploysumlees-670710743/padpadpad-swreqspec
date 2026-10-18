"""Selection batch model for the selection feature."""

from dataclasses import dataclass

# รองรับ: FR-SEL-02, FR-SEL-03, CON-SEL-01


@dataclass
class SelectionBatch:
    """A quota-based selection batch for eligible applicants."""

    batch_id: str
    requested_quota: int
    actual_selected_count: int = 0
    max_quota: int = 150
    created_by: str | None = None
    created_at: str | None = None
    status: str = "draft"

    def __post_init__(self) -> None:
        if not self.batch_id:
            raise ValueError("batch_id is required")
        if self.requested_quota < 0:
            raise ValueError("requested_quota must not be negative")
        if self.max_quota <= 0:
            raise ValueError("max_quota must be greater than zero")
        if self.requested_quota > self.max_quota:
            raise ValueError("requested_quota must not exceed max_quota")
        if self.status not in {"draft", "confirmed", "cancelled"}:
            raise ValueError("status must be draft, confirmed, or cancelled")
