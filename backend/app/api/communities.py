"""UC-01 REST API: FR-01-01..05, AF-01-01, AC-01, C-01, C-02."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from backend.app.services.community_location_service import CommunityService

router = APIRouter(tags=["UC-01 community location"])


class CommunityFields(BaseModel):
    community_name: str = Field(min_length=1)
    caretaker_name: str = Field(min_length=1)
    contact_phone: str = Field(min_length=1)
    caretaker_title: str = ""
    local_rules: str = ""

    @field_validator("community_name", "caretaker_name", "contact_phone")
    @classmethod
    def no_blank_required_fields(cls, value: str) -> str:
        """AF-01-01: reject missing/blank fields; Q-01-01 phone format remains open."""
        if not value.strip():
            raise ValueError("กรุณากรอกข้อมูลสำคัญ")
        return value.strip()


class CreateCommunity(CommunityFields):
    location_id: str = Field(min_length=1)


def get_committee_user_id(request: Request) -> str:
    """C-01: identity/role must come from trusted authentication middleware."""
    user_id = getattr(request.state, "user_id", None)
    role = getattr(request.state, "role", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    if role != "committee":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Committee role required")
    return user_id


def get_community_service() -> CommunityService:
    return CommunityService()


def permission_or_not_found(exc: Exception) -> HTTPException:
    """C-01: translate service authorization failure into 403."""
    if isinstance(exc, PermissionError):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.post("/api/communities", status_code=status.HTTP_201_CREATED)
def create_community(
    payload: CreateCommunity,
    user_id: str = Depends(get_committee_user_id),
    service: CommunityService = Depends(get_community_service),
):
    """AC-01: save fields and location reference, return confirmation data."""
    try:
        return service.create(user_id, payload.location_id,
                              payload.model_dump(exclude={"location_id"}))
    except PermissionError as exc:
        raise permission_or_not_found(exc) from None


@router.get("/api/locations/assigned")
def get_assigned_locations(
    user_id: str = Depends(get_committee_user_id),
    service: CommunityService = Depends(get_community_service),
):
    """FR-01-02/C-01: return only locations assigned to this authenticated committee member."""
    return service.list_assigned_locations(user_id)


@router.get("/api/locations/{location_id}/communities")
def get_communities(
    location_id: str,
    user_id: str = Depends(get_committee_user_id),
    service: CommunityService = Depends(get_community_service),
):
    """FR-01-01..02, C-01: only the assigned camp location is visible."""
    try:
        return service.list_for_location(user_id, location_id)
    except PermissionError as exc:
        raise permission_or_not_found(exc) from None


@router.put("/api/communities/{community_id}")
def update_community(
    community_id: str,
    payload: CommunityFields,
    user_id: str = Depends(get_committee_user_id),
    service: CommunityService = Depends(get_community_service),
):
    """C-01: the user may update fields but may not move a community to another camp."""
    try:
        return service.update(user_id, community_id, payload.model_dump())
    except (PermissionError, LookupError) as exc:
        raise permission_or_not_found(exc) from None
