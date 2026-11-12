"""FastAPI entrypoint for the camp enrollment backend."""

import asyncio
import os
import secrets
from collections.abc import Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from backend.app.api.camp_enrollment import router as camp_enrollment_router
from backend.app.api.authentication import router as authentication_router
from backend.app.db.database import ensure_database


def create_app(
    *,
    secret_key: str | None = None,
    database_initializer: Callable[[], None] | None = None,
) -> FastAPI:
    """Create the API app with signed sessions and PostgreSQL startup verification (CON-ENR-02, NFR-SEC-01)."""
    configured_secret = secret_key or os.getenv("APP_SECRET")
    secret_is_configured = bool(configured_secret)
    session_secret = configured_secret or secrets.token_urlsafe(32)
    initialize_database = database_initializer or ensure_database

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        if not secret_is_configured:
            raise RuntimeError("APP_SECRET must be configured before serving requests.")
        await asyncio.to_thread(initialize_database)
        yield

    app = FastAPI(title="Camp Enrollment API", lifespan=lifespan)
    app.state.session_secret = session_secret
    app.add_middleware(SessionMiddleware, secret_key=session_secret)
    app.include_router(authentication_router)
    app.include_router(camp_enrollment_router)
    return app


app = create_app()
