import sqlite3
from pathlib import Path

import pytest

from backend.app.models.user_account import UserAccount


# รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-01, ASM-LOG-02, ASM-LOG-03
def test_login_schema_foundation() -> None:
    student = UserAccount(
        username="student-001",
        password_hash="pbkdf2_sha256$salt$digest",
        status="active",
        role="student",
    )
    committee = UserAccount(
        username="committee-001",
        password_hash="pbkdf2_sha256$salt$digest",
        status="active",
        role="committee",
    )
    faculty = UserAccount(
        username="faculty-001",
        password_hash="pbkdf2_sha256$salt$digest",
        status="suspended",
        role="faculty",
    )
    unsupported_role = UserAccount(
        username="staff-001",
        password_hash="pbkdf2_sha256$salt$digest",
        status="active",
        role="staff",
    )

    assert {student.role, committee.role, faculty.role} == {
        "student",
        "committee",
        "faculty",
    }
    assert faculty.status == "suspended"
    assert unsupported_role.role == "staff"
    assert "password" not in UserAccount.__dataclass_fields__

    with pytest.raises(ValueError, match="status must be active or suspended"):
        UserAccount(
            username="user-002",
            password_hash="pbkdf2_sha256$salt$digest",
            status="pending",
            role="student",
        )

    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    connection = sqlite3.connect(":memory:")
    try:
        connection.executescript(schema_sql)
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(user_accounts)")
        }
        connection.execute(
            """
            INSERT INTO user_accounts (username, password_hash, status, role)
            VALUES (?, ?, ?, ?)
            """,
            (student.username, student.password_hash, student.status, student.role),
        )
        stored = connection.execute(
            "SELECT username, password_hash, status, role FROM user_accounts"
        ).fetchone()
        with pytest.raises(sqlite3.IntegrityError):
            connection.execute(
                """
                INSERT INTO user_accounts (username, password_hash, status, role)
                VALUES (?, ?, ?, ?)
                """,
                ("bad-status", "hash", "pending", "student"),
            )
    finally:
        connection.close()

    assert columns == {"username", "password_hash", "status", "role"}
    assert stored == ("student-001", "pbkdf2_sha256$salt$digest", "active", "student")
