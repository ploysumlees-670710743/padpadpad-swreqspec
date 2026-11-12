"""FastAPI application entry point for UC-14."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.app.api.applicants import router as applicants_router
from backend.app.api.application_status import router as application_status_router
from backend.app.api.votes import router as votes_router
from backend.app.api.communities import router as communities_router
from backend.app.api.project_approval import router as project_approval_router
from backend.app.services.application_status_service import ApplicationStatusService
from backend.app.services.vote_service import VoteService
from backend.app.services.community_location_service import CommunityService
from backend.app.services.project_approval_service import ProjectApprovalService


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize the application status database before serving requests (FR-STA-01)."""

    ApplicationStatusService().initialize()
    VoteService().initialize()
    CommunityService().initialize()
    ProjectApprovalService().initialize()
    yield


app = FastAPI(title="Camp Application Status", lifespan=lifespan)
app.include_router(applicants_router)
app.include_router(application_status_router)
app.include_router(votes_router)
app.include_router(communities_router)
app.include_router(project_approval_router)
"""FastAPI application entry point for UC-14."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.app.api.applicants import router as applicants_router
from backend.app.api.application_status import router as application_status_router
from backend.app.api.schedule import router as schedule_router
from backend.app.api.votes import router as votes_router
from backend.app.services.application_status_service import ApplicationStatusService
from backend.app.services.vote_service import VoteService


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize the application status database before serving requests (FR-STA-01)."""

    ApplicationStatusService().initialize()
    VoteService().initialize()
    yield


app = FastAPI(title="Camp Application Status", lifespan=lifespan)
app.include_router(applicants_router)
app.include_router(application_status_router)
app.include_router(schedule_router)
app.include_router(votes_router)
