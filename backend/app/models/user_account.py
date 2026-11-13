"""User account model for authentication and legacy role-based authorization."""

from dataclasses import dataclass


@dataclass(init=False, repr=True)
class UserAccount:
    """Support both login schema fields and legacy applicant-role fields."""

    username: str
    password_hash: str
    status: str | None
    role: str

    def __init__(
        self,
        username: str | None = None,
        password_hash: str | None = None,
        status: str | None = None,
        role: str | None = None,
        *,
        user_id: str | None = None,
        display_name: str | None = None,
    ) -> None:
        resolved_username = username or user_id or ""
        resolved_user_id = user_id or resolved_username
        resolved_display_name = display_name or user_id or resolved_username or ""

        if not resolved_user_id and not resolved_username:
            raise ValueError("user_id or username is required")
        if not role:
            raise ValueError("role is required")
        if status is not None and status not in {"active", "suspended"}:
            raise ValueError("status must be active or suspended")

        self.username = resolved_username
        self.password_hash = password_hash or ""
        self.status = status
        self.role = role
        self.user_id = resolved_user_id
        self.display_name = resolved_display_name

    def __repr__(self) -> str:
        return (
            "UserAccount(username={!r}, password_hash={!r}, status={!r}, role={!r}, "
            "user_id={!r}, display_name={!r})"
        ).format(
            self.username,
            self.password_hash,
            self.status,
            self.role,
            getattr(self, "user_id", None),
            getattr(self, "display_name", None),
        )
