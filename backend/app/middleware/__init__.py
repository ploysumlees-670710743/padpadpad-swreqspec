
"""Middleware utilities for backend request handling."""

from .auth import get_current_student_id, get_current_user_id

__all__ = [
    "get_current_student_id",
    "get_current_user_id",
]
