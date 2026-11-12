"""User account model for applicant editing authorization."""

from dataclasses import dataclass


@dataclass(frozen=True)
class UserAccount:
    """Authenticated user role required by SEC-RBAC-01."""

    user_id: str
    role: str
    display_name: str

    def __post_init__(self) -> None:
        if not self.user_id or not self.display_name:
            raise ValueError("user_id and display_name are required")
        if not self.role:
            raise ValueError("role is required")
