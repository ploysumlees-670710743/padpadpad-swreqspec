import pytest

from backend.app.models import SubActivity
from backend.app.services import schedule_service


# Given: ผู้ใช้ที่มีสิทธิ์จัดการเปิดหน้า Schedule Management และมีกิจกรรมเดิมในสถานที่เดียวกันช่วงเวลา 09:00-10:00
# When: พยายามเพิ่มกิจกรรมใหม่ในสถานที่เดียวกันเวลา 09:30-10:30
# Then: ระบบต้องปฏิเสธการบันทึก, ไม่เพิ่มกิจกรรมใหม่ลงในตาราง, และแสดงข้อความแจ้งเตือนบริเวณฟิลด์ช่วงเวลา/สถานที่ว่ามีการซ้อนทับ

def test_TC_SCH_02_1_reject_overlapping_activity() -> None:
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

    with pytest.raises(ValueError, match="overlaps"):
        schedule_service.create_activity(
            {
                "project_id": project_id,
                "location_id": "loc-001",
                "activity_name": "กิจกรรมซ้อนทับ",
                "activity_date": "2026-01-10",
                "start_time": "09:30",
                "end_time": "10:30",
                "description": "ซ้อนทับ",
                "facilitator_or_responsible": "อาจารย์หญิง",
            },
            project_id=project_id,
        )

    activities = schedule_service.get_schedule_for_user(
        project_id,
        {"user_id": "u-1", "role": "committee", "can_view_schedule": True, "can_manage_schedule": True},
    )
    assert [activity.activity_name for activity in activities] == ["กิจกรรมเดิม"]


# Given: ผู้ใช้ที่มีสิทธิ์จัดการมีกิจกรรมเดิม 09:00-10:00 ในสถานที่เดียวกัน และกำลังเพิ่มกิจกรรมใหม่ที่เริ่มตรงเวลา 10:00 ด้วยสถานที่เดียวกัน
# When: กดบันทึกกิจกรรมใหม่
# Then: ระบบต้องยอมให้บันทึกได้ เพราะช่วงเวลาไม่ซ้อนทับกัน และไม่แสดงข้อผิดพลาดบริเวณฟิลด์ช่วงเวลา/สถานที่ตาม CON-SCH-01

def test_TC_SCH_02_2_boundary_same_location_non_overlap_allowed() -> None:
    project_id = "project-001"
    schedule_service.seed_schedule(
        project_id,
        [
            SubActivity(
                activity_id="act-200",
                project_id=project_id,
                location_id="loc-002",
                activity_name="กิจกรรมแรก",
                activity_date="2026-01-10",
                start_time="09:00",
                end_time="10:00",
                description="มีอยู่แล้ว",
                facilitator_or_responsible="อาจารย์สมชาย",
            )
        ],
    )

    created = schedule_service.create_activity(
        {
            "project_id": project_id,
            "location_id": "loc-002",
            "activity_name": "กิจกรรมที่สอง",
            "activity_date": "2026-01-10",
            "start_time": "10:00",
            "end_time": "11:00",
            "description": "เริ่มตรงเวลา 10:00",
            "facilitator_or_responsible": "อาจารย์หญิง",
        },
        project_id=project_id,
    )

    assert created.activity_name == "กิจกรรมที่สอง"
    assert created.checklist_status == "Pending"


# Given: ผู้ใช้ที่มีสิทธิ์จัดการกำลังเพิ่มหรือแก้ไขกิจกรรมใหม่ แต่ข้อมูลช่วงเวลา/สถานที่ซ้อนทับกับกิจกรรมอื่นที่มีอยู่แล้ว
# When: กดบันทึกโดยไม่ทำการแก้ไขก่อน
# Then: ระบบต้องปฏิเสธการบันทึกและคงข้อมูลเดิมไว้ โดยไม่ให้มีรายการใหม่หรือเปลี่ยนแปลงรายการเดิมแม้จะกดบันทึกซ้ำ

def test_TC_SCH_02_3_do_not_commit_overlap_changes() -> None:
    project_id = "project-001"
    schedule_service.seed_schedule(
        project_id,
        [
            SubActivity(
                activity_id="act-300",
                project_id=project_id,
                location_id="loc-003",
                activity_name="กิจกรรมเดิม",
                activity_date="2026-01-10",
                start_time="08:00",
                end_time="09:00",
                description="เดิม",
                facilitator_or_responsible="คนที่ 1",
            )
        ],
    )

    with pytest.raises(ValueError, match="overlaps"):
        schedule_service.update_activity(
            "act-300",
            {
                "project_id": project_id,
                "location_id": "loc-003",
                "activity_name": "กิจกรรมแก้ไข",
                "activity_date": "2026-01-10",
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
