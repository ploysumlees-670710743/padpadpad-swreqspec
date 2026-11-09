"""Transactional helpers for in-memory schedule mutations."""

from __future__ import annotations

from collections.abc import Callable, Iterator
from contextlib import contextmanager

# รองรับ: NFR-REL-01, FR-SCH-03, FR-SCH-05


class Transaction:
    """Track undo callbacks for a transactional mutation (NFR-REL-01)."""

    def __init__(self) -> None:
        self._undo_callbacks: list[Callable[[], None]] = []

    def register_undo(self, callback: Callable[[], None]) -> None:
        """Register an action to restore prior state when the transaction fails."""
        self._undo_callbacks.append(callback)

    def rollback(self) -> None:
        """Revert all changes in reverse order."""
        while self._undo_callbacks:
            callback = self._undo_callbacks.pop()
            callback()


@contextmanager
def transaction() -> Iterator[Transaction]:
    """Execute an in-memory mutation as a transaction with rollback on failure (NFR-REL-01)."""
    tx = Transaction()
    try:
        yield tx
    except Exception:
        tx.rollback()
        raise
