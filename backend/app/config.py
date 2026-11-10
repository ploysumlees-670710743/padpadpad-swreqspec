"""Runtime configuration for camp enrollment."""

import os


class CampConfigurationError(RuntimeError):
    """Raised when the single configured camp cannot be identified (CON-ENR-01)."""


def get_configured_camp_id() -> str:
    """Read the single camp identifier from the server environment (FR-ENR-01, CON-ENR-01)."""
    camp_id = os.getenv("CAMP_ID")
    if camp_id is None or not camp_id.strip():
        raise CampConfigurationError("CAMP_ID is not configured.")
    return camp_id
