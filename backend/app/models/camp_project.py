"""Camp project model for schedule management."""

from dataclasses import dataclass

# รองรับ: FR-SCH-01, CON-SCH-02, CON-SCH-03


@dataclass
class CampProject:
    """Project metadata used as a precondition for schedule management."""

    project_id: str
    project_name: str
    status: str = "active"

    def __post_init__(self) -> None:
        if not self.project_id or not self.project_name:
            raise ValueError("project_id and project_name are required")
        if self.status not in {"active", "draft", "archived"}:
            raise ValueError("status must be one of active, draft, archived")
