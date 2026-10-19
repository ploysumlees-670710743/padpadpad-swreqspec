"""Application status response model for UC-14."""

from pydantic import BaseModel


class ApplicationStatus(BaseModel):
    """Return a student's application status and camp summary (FR-STA-01)."""

    application_id: str
    status: str
    camp_name: str
    activity_start_at: str
    activity_end_at: str
    camp_location: str
    preparation_info: str
