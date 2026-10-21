"""Audit log model for selection confirmation."""

from dataclasses import dataclass

# รองรับ: FR-SEL-07, CON-SEL-04, ASM-09


@dataclass
class SelectionAuditLog:
    """Single audit record created when a selection batch is confirmed."""

    log_id: str
    batch_id: str
    actor_id: str
    action_name: str
    target_type: str
    target_id: str
    action_time: str
    result_status: str

    def __post_init__(self) -> None:
        required_fields = {
            "log_id": self.log_id,
            "batch_id": self.batch_id,
            "actor_id": self.actor_id,
            "action_name": self.action_name,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "action_time": self.action_time,
            "result_status": self.result_status,
        }
        missing = [name for name, value in required_fields.items() if not value]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
