"""PostgreSQL connection helpers for the camp enrollment backend."""

import os

import psycopg
from psycopg import Connection

DATABASE_URL = os.getenv("DATABASE_URL")


def get_database_connection() -> Connection:
    """Open the configured PostgreSQL connection without creating another database."""
    # รองรับ: CON-ENR-02, NFR-SEC-01
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL must be configured for PostgreSQL.")
    return psycopg.connect(DATABASE_URL)


def ensure_database() -> None:
    """Verify PostgreSQL connectivity before the FastAPI application starts."""
    # รองรับ: CON-ENR-02, NFR-SEC-01
    with get_database_connection() as connection:
        connection.execute("SELECT 1")
