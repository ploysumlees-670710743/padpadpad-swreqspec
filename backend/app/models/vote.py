"""Voting models for UC-08."""

from dataclasses import dataclass


@dataclass(frozen=True)
class VoteEligibility:
    """Track whether a voter has used their right in a round (FR-VOT-04)."""

    user_id: str
    round_id: str
    has_voted: bool = False

    def __post_init__(self) -> None:
        if not self.user_id or not self.round_id:
            raise ValueError("user_id and round_id are required")


@dataclass(frozen=True)
class VoteBallot:
    """Represent a secret ballot without storing voter identity (CON-DATA-01)."""

    round_id: str
    location_id: str

    def __post_init__(self) -> None:
        if not self.round_id or not self.location_id:
            raise ValueError("round_id and location_id are required")
