"""Camp location model for schedule management."""

from dataclasses import dataclass

# รองรับ: FR-SCH-01, CON-SCH-01, CON-SCH-02


@dataclass
class CampLocation:
    """Preferred venue information for a camp project."""

    location_id: str
    project_id: str
    location_name: str

    def __post_init__(self) -> None:
        if not self.location_id or not self.project_id or not self.location_name:
            raise ValueError("location_id, project_id and location_name are required")
