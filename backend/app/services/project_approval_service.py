"""UC-07 project submission/review, persistent immutable audit and in-app notifications.

Team-chosen SQLite storage (not a spec-mandated technology).
UC-09/committee management must provision memberships securely; there is no
endpoint for users to grant themselves an approval role or project membership.
"""
import sqlite3
from pathlib import Path
from uuid import uuid4

DEFAULT_DB = Path(__file__).resolve().parents[2] / "db" / "application_status.sqlite3"

SCHEMA = """
CREATE TABLE IF NOT EXISTS uc07_project_memberships (
    project_id TEXT NOT NULL REFERENCES camp_projects(project_id),
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('committee', 'advisor')),
    PRIMARY KEY (project_id, user_id, role)
);
CREATE TABLE IF NOT EXISTS uc07_project_approvals (
    project_id TEXT PRIMARY KEY REFERENCES camp_projects(project_id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'revision')),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS uc07_approval_history (
    history_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES camp_projects(project_id),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'revision')),
    feedback TEXT NOT NULL DEFAULT '',
    occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER IF NOT EXISTS uc07_history_immutable_update
BEFORE UPDATE ON uc07_approval_history BEGIN
    SELECT RAISE(ABORT, 'approval history is immutable');
END;
CREATE TRIGGER IF NOT EXISTS uc07_history_immutable_delete
BEFORE DELETE ON uc07_approval_history BEGIN
    SELECT RAISE(ABORT, 'approval history is immutable');
END;
CREATE TABLE IF NOT EXISTS uc07_notifications (
    notification_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES camp_projects(project_id),
    recipient_user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uc07_notice_recipient
    ON uc07_notifications (recipient_user_id, project_id);
"""


class ApprovalForbiddenError(PermissionError):
    pass


class ApprovalStateError(ValueError):
    pass


class ProjectApprovalService:
    """AC-07, C-01, C-02, AF-07-01/02, QR-01/02."""

    def __init__(self, database_path: Path = DEFAULT_DB):
        self.database_path = Path(database_path)

    def connect(self):
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def initialize(self):
        """Use existing camp_projects and add only UC-07-owned tables."""
        with self.connect() as connection:
            connection.executescript(SCHEMA)

    @staticmethod
    def _require_member(connection, project_id, user_id, role):
        """QR-01: only assigned committee/adviser, never client-selected actor."""
        if not connection.execute(
            """SELECT 1 FROM uc07_project_memberships
               WHERE project_id=? AND user_id=? AND role=?""",
            (project_id, user_id, role),
        ).fetchone():
            raise ApprovalForbiddenError("ไม่มีสิทธิ์ในโครงการนี้")

    @staticmethod
    def _require_project(connection, project_id):
        """Only existing camp project may enter approval flow."""
        row = connection.execute(
            "SELECT project_name FROM camp_projects WHERE project_id=?",
            (project_id,),
        ).fetchone()
        if row is None:
            raise LookupError("ไม่พบโครงการ")
        return row["project_name"]

    @staticmethod
    def _append_history(connection, project_id, actor_id, action, feedback=""):
        """QR-02: append-only audit history (protected by SQLite triggers)."""
        connection.execute(
            """INSERT INTO uc07_approval_history
               (history_id, project_id, actor_id, action, feedback)
               VALUES (?, ?, ?, ?, ?)""",
            (uuid4().hex, project_id, actor_id, action, feedback),
        )

    @classmethod
    def _snapshot(cls, connection, project_id):
        project_name = cls._require_project(connection, project_id)
        row = connection.execute(
            "SELECT status, updated_at FROM uc07_project_approvals WHERE project_id=?",
            (project_id,),
        ).fetchone()
        history = connection.execute(
            """SELECT history_id, actor_id, action, feedback, occurred_at
               FROM uc07_approval_history WHERE project_id=?
               ORDER BY occurred_at, rowid""",
            (project_id,),
        ).fetchall()
        return {
            "project_id": project_id, "project_name": project_name,
            "status": row["status"] if row else "not_submitted",
            "updated_at": row["updated_at"] if row else None,
            "history": [dict(item) for item in history],
        }

    def submit(self, project_id, user_id):
        """FR-07-01, C-02: committee submits or resubmits only after revision."""
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._require_project(connection, project_id)
            self._require_member(connection, project_id, user_id, "committee")
            current = connection.execute(
                "SELECT status FROM uc07_project_approvals WHERE project_id=?",
                (project_id,),
            ).fetchone()
            if current is not None and current["status"] != "revision":
                raise ApprovalStateError("โครงการไม่อยู่ในสถานะส่งขออนุมัติได้")
            if current is None:
                connection.execute(
                    """INSERT INTO uc07_project_approvals(project_id,status)
                       VALUES (?, 'pending')""",
                    (project_id,),
                )
            else:
                connection.execute(
                    """UPDATE uc07_project_approvals
                       SET status='pending', updated_at=CURRENT_TIMESTAMP
                       WHERE project_id=?""",
                    (project_id,),
                )
            self._append_history(connection, project_id, user_id, "submitted")
            return self._snapshot(connection, project_id)

    def review(self, project_id, advisor_id, decision, feedback):
        """AC-07, AF-07-01/02: only the assigned adviser reviews a pending project."""
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._require_project(connection, project_id)
            self._require_member(connection, project_id, advisor_id, "advisor")
            current = connection.execute(
                "SELECT status FROM uc07_project_approvals WHERE project_id=?",
                (project_id,),
            ).fetchone()
            if current is None or current["status"] != "pending":
                raise ApprovalStateError("โครงการยังไม่รอการพิจารณา")
            if decision not in {"approved", "rejected", "revision"}:
                raise ApprovalStateError("ผลการพิจารณาไม่ถูกต้อง")
            if decision in {"rejected", "revision"} and not feedback.strip():
                raise ApprovalStateError("กรุณาระบุเหตุผลหรือข้อเสนอแนะ")
            connection.execute(
                """UPDATE uc07_project_approvals
                   SET status=?, updated_at=CURRENT_TIMESTAMP
                   WHERE project_id=?""",
                (decision, project_id),
            )
            self._append_history(connection, project_id, advisor_id, decision, feedback.strip())
            # AC-07: notify assigned committee users inside the application.
            recipients = connection.execute(
                """SELECT DISTINCT user_id FROM uc07_project_memberships
                   WHERE project_id=? AND role='committee'""",
                (project_id,),
            ).fetchall()
            for recipient in recipients:
                connection.execute(
                    """INSERT INTO uc07_notifications
                       (notification_id, project_id, recipient_user_id, status, message)
                       VALUES (?, ?, ?, ?, ?)""",
                    (uuid4().hex, project_id, recipient["user_id"], decision,
                     feedback.strip() or "มีผลการพิจารณาโครงการแล้ว"),
                )
            return self._snapshot(connection, project_id)

    def get_status(self, project_id, user_id, role):
        """FR-07-05: committee and assigned adviser can read latest status."""
        with self.connect() as connection:
            self._require_project(connection, project_id)
            self._require_member(connection, project_id, user_id,
                                 "advisor" if role == "faculty" else "committee")
            return self._snapshot(connection, project_id)

    def get_notifications(self, project_id, committee_id):
        """AC-07: list in-app notifications for the signed-in committee only."""
        with self.connect() as connection:
            self._require_project(connection, project_id)
            self._require_member(connection, project_id, committee_id, "committee")
            rows = connection.execute(
                """SELECT notification_id, project_id, status, message, created_at
                   FROM uc07_notifications WHERE project_id=? AND recipient_user_id=?
                   ORDER BY created_at, rowid""",
                (project_id, committee_id),
            ).fetchall()
            return [dict(row) for row in rows]
