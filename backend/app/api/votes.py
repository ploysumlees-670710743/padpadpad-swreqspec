"""Voting API for UC-08."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.middleware.authz import get_authenticated_voter_id
from backend.app.services.vote_service import (
    AlreadyVotedError,
    IneligibleVoterError,
    VoteService,
)

router = APIRouter(prefix="/api/votes", tags=["votes"])


class VoteRequest(BaseModel):
    """Vote selection input; voter identity is never accepted in the request (CON-DATA-01)."""

    round_id: str = Field(min_length=1)
    location_id: str = Field(min_length=1)


class VoteResponse(BaseModel):
    """Return the updated total and the authenticated voter's eligibility state (FR-VOT-05)."""

    total_votes: int
    has_voted: bool


class VoteLocationResponse(BaseModel):
    """Describe one prototype location and its displayed result (FR-VOT-01, FR-VOT-05)."""

    location_id: str
    name: str
    image_url: str
    survey_summary: str
    total_votes: int


class VoteLocationsResponse(BaseModel):
    """Return prototype locations and the requested round (FR-VOT-01, FR-VOT-05)."""

    round_id: str
    has_voted: bool
    locations: list[VoteLocationResponse]


def get_vote_service() -> VoteService:
    """Provide the voting service (CON-TECH-01)."""

    return VoteService()


@router.get("/locations", response_model=VoteLocationsResponse)
def get_vote_locations(
    round_id: str = Query(min_length=1),
    service: VoteService = Depends(get_vote_service),
) -> VoteLocationsResponse:
    """List team-approved mock locations and displayed totals (FR-VOT-01, FR-VOT-05)."""

    return VoteLocationsResponse(**service.get_vote_locations(round_id))


@router.post("", response_model=VoteResponse)
def cast_vote(
    vote: VoteRequest,
    user_id: str = Depends(get_authenticated_voter_id),
    service: VoteService = Depends(get_vote_service),
) -> VoteResponse:
    """Record one eligible vote and return the refreshed result (FR-VOT-03, FR-VOT-04, FR-VOT-05)."""

    try:
        total_votes = service.cast_vote(user_id, vote.round_id, vote.location_id)
    except IneligibleVoterError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ผู้ใช้ไม่มีสิทธิ์ลงคะแนน",
        ) from None
    except AlreadyVotedError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ท่านได้ใช้สิทธิ์ไปแล้ว",
        ) from None

    return VoteResponse(total_votes=total_votes, has_voted=True)
