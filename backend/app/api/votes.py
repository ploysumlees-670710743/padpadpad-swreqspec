"""Voting API for UC-08."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

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


def get_authenticated_voter_id(request: Request) -> str:
    """Read identity from trusted authentication middleware and fail closed (CON-SEC-01)."""

    user_id = getattr(request.state, "user_id", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ระบบยืนยันตัวตนขัดข้อง",
        )
    return user_id


def get_vote_service() -> VoteService:
    """Provide the voting service (CON-TECH-01)."""

    return VoteService()


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
