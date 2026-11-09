import pytest

from backend.app.models import SubActivity
from backend.app.services import schedule_service


# Given: ผู้มีสิทธิ์จัดการมีกิจกรรมเดิมที่ใช้สถานที่เดียวกันอยู่แล้ว;
# When: พยายามเพิ่มกิจกรรมใหม่ที่ครอบคลุมช่วงเวลาเดียวกันและสถานที่เดียวกัน;
# Then: ระบบต้องปฏิเสธการบันทึกและต้องไม่เปลี่ยนแปลงรายการกิจกรรมเดิม

def test_AC_SCH_02_reject_overlapping_activity_and_rollback() -> None:
    project_id = "project-001"
    schedule_service.seed_schedule(
        project_id,
        [
            SubActivity(
                activity_id="act-100",
                project_id=project_id,
                location_id="loc-001",
                activity_name="กิจกรรมเดิม",
                activity_date="2026-01-10",
                start_time="09:00",
                end_time="10:00",
                description="มีอยู่แล้ว",
                facilitator_or_responsible="อาจารย์สมชาย",
            )
        ],
    )

    before = schedule_service.get_schedule_for_user(project_id, {"user_id": "u-1", "role": "committee", "can_view_schedule": True, "can_manage_schedule": True})

    with pytest.raises(ValueError, match="overlaps"):
        schedule_service.create_activity(
            {
                "project_id": project_id,
                "location_id": "loc-001",
                "activity_name": "กิจกรรมซ้อนทับ",
                "activity_date": "2026-01-10",
                "start_time": "09:30",
                "end_time": "10:30",
                "description": "จะซ้อนทับ",
                "facilitator_or_responsible": "อาจารย์หญิง",
            },
            project_id=project_id,
        )

    after = schedule_service.get_schedule_for_user(project_id, {"user_id": "u-1", "role": "committee", "can_view_schedule": True, "can_manage_schedule": True})
    assert len(after) == len(before) == 1
    assert after[0].activity_name == "กิจกรรมเดิม"
    assert after[0].checklist_status == "Pending"


# Given: ผู้มีสิทธิ์จัดการยืนยันว่ามีข้อมูลเดิมในสถานที่เดียวกัน;
# When: ทำการอัปเดตกิจกรรมให้ซ้อนทับกับข้อมูลที่มีอยู่แล้ว;
# Then: ระบบต้องยกเลิกการแก้ไขทั้งหมดและคงข้อมูลเดิมไว้

def test_schedule_update_rolls_back_on_overlap() -> None:
    project_id = "project-001"
    schedule_service.seed_schedule(
        project_id,
        [
            SubActivity(
                activity_id="act-200",
                project_id=project_id,
                location_id="loc-002",
                activity_name="กิจกรรม A",
                activity_date="2026-01-11",
                start_time="08:00",
                end_time="09:00",
                description="สำหรับทดสอบ",
                facilitator_or_responsible="คนที่ 1",
            ),
            SubActivity(
                activity_id="act-201",
                project_id=project_id,
                location_id="loc-002",
                activity_name="กิจกรรม B",
                activity_date="2026-01-11",
                start_time="09:30",
                end_time="10:30",
                description="สำหรับทดสอบ",
                facilitator_or_responsible="คนที่ 2",
            ),
        ],
    )

    with pytest.raises(ValueError, match="overlaps"):
        schedule_service.update_activity(
            "act-200",
            {
                "project_id": project_id,
                "location_id": "loc-002",
                "activity_name": "กิจกรรม A ใหม่",
                "activity_date": "2026-01-11",
                "start_time": "09:00",
                "end_time": "10:00",
                "description": "มีการซ้อนทับ",
                "facilitator_or_responsible": "คนที่ 1",
            },
            project_id=project_id,
        )

    updated = schedule_service.get_schedule_for_user(project_id, {"user_id": "u-1", "role": "committee", "can_view_schedule": True, "can_manage_schedule": True})
    assert [activity.activity_name for activity in updated] == ["กิจกรรม A", "กิจกรรม B"]


# Given: ผู้มีสิทธิ์จัดการสร้างกิจกรรมใหม่ในช่วงเวลาและสถานที่ซ้อนทับกับกิจกรรมเดิม
# When: ระบบปฏิเสธการบันทึก
# Then: ข้อผิดพลาดต้องระบุว่าเกิด overlap และยังคงข้อมูลเดิมไว้ตาม FR-SCH-04

def test_AC_SCH_02_reject_overlapping_activity_with_field_errors() -> None:
    project_id = "project-001"
    schedule_service.seed_schedule(
        project_id,
        [
            SubActivity(
                activity_id="act-400",
                project_id=project_id,
                location_id="loc-004",
                activity_name="กิจกรรมเดิม",
                activity_date="2026-01-12",
                start_time="08:00",
                end_time="09:00",
                description="เดิม",
                facilitator_or_responsible="คนที่ 1",
            )
        ],
    )

    with pytest.raises(ValueError, match="overlaps"):
        schedule_service.create_activity(
            {
                "project_id": project_id,
                "location_id": "loc-004",
                "activity_name": "กิจกรรมซ้อนทับ",
                "activity_date": "2026-01-12",
                "start_time": "08:30",
                "end_time": "09:30",
                "description": "ซ้อนทับ",
                "facilitator_or_responsible": "คนที่ 2",
            },
            project_id=project_id,
        )

    activities = schedule_service.get_schedule_for_user(
        project_id,
        {"user_id": "u-1", "role": "committee", "can_view_schedule": True, "can_manage_schedule": True},
    )
    assert [activity.activity_name for activity in activities] == ["กิจกรรมเดิม"]
