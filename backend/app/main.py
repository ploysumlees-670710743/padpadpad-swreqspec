"""FastAPI application entry point for UC-14."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.app.api.application_status import router as application_status_router
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
app.include_router(application_status_router)
app.include_router(votes_router)
