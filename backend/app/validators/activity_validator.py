"""Validation helpers for camp schedule activity payloads."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

# รองรับ: FR-SCH-02, FR-SCH-03, FR-SCH-05, CON-SCH-01

_REQUIRED_FIELDS = (
    "project_id",
    "location_id",
    "activity_name",
    "activity_date",
    "start_time",
    "end_time",
    "description",
    "facilitator_or_responsible",
)


def validate_activity_payload(payload: Mapping[str, Any]) -> dict[str, Any]:
    """Validate required schedule fields before create/update (FR-SCH-02, CON-SCH-01)."""
    normalized = dict(payload)
    missing = [field for field in _REQUIRED_FIELDS if not str(normalized.get(field, "")).strip()]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    if str(normalized["start_time"]) >= str(normalized["end_time"]):
        raise ValueError("end_time must be later than start_time")
    return normalized


def validate_checklist_status(status: Any) -> str:
    """Validate checklist updates to Pending/Done (FR-SCH-01, FR-SCH-05)."""
    value = str(status)
    if value not in {"Pending", "Done"}:
        raise ValueError("checklist_status must be either Pending or Done")
    return value
