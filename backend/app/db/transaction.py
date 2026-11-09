"""SQLite transaction helper for applicant updates and audit logging."""

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def transaction(connection: sqlite3.Connection) -> Iterator[sqlite3.Connection]:
    """Commit or roll back one atomic unit for DOM-TXN-01."""

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
