"""Sub activity model for schedule management."""

from dataclasses import dataclass

# รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-05, CON-SCH-01, CON-SCH-03


@dataclass
class SubActivity:
    """A single activity item in the camp schedule."""

    activity_id: str
    project_id: str
    location_id: str
    activity_name: str
    activity_date: str
    start_time: str
    end_time: str
    description: str
    facilitator_or_responsible: str
    checklist_status: str = "Pending"
    created_by: str | None = None
    updated_by: str | None = None

    def __post_init__(self) -> None:
        required_fields = {
            "activity_id": self.activity_id,
            "project_id": self.project_id,
            "location_id": self.location_id,
            "activity_name": self.activity_name,
            "activity_date": self.activity_date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "description": self.description,
            "facilitator_or_responsible": self.facilitator_or_responsible,
        }
        missing = [name for name, value in required_fields.items() if not value]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        if self.checklist_status not in {"Pending", "Done"}:
            raise ValueError("checklist_status must be either Pending or Done")

        if self.start_time >= self.end_time:
            raise ValueError("end_time must be later than start_time")

    def mark_done(self) -> None:
        self.checklist_status = "Done"

    def mark_pending(self) -> None:
        self.checklist_status = "Pending"
