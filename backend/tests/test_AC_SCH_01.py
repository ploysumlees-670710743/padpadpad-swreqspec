import pytest

from backend.app.models import SubActivity


# Given: ผู้ใช้ที่มีสิทธิ์จัดการเปิดหน้าจัดการตารางกิจกรรม และมีข้อมูลโครงการค่าย/สถานที่พร้อมใช้งาน;
# When: กรอกชื่อกิจกรรม วัน ช่วงเวลา สถานที่ รายละเอียด และผู้รับผิดชอบครบถ้วน แล้วกดบันทึกกิจกรรมใหม่;
# Then: ระบบต้องตรวจว่าช่วงเวลาและสถานที่ไม่ซ้อนทับ, บันทึกกิจกรรมเข้าสู่ตารางค่าย,
#       แสดงสถานะ checklist เป็น Pending และกิจกรรมสามารถเปลี่ยนเป็น Done ได้ในตาราง/สถานะ

def test_TC_SCH_01_1_create_valid_activity_and_pending_status() -> None:
    activity = SubActivity(
        activity_id="act-001",
        project_id="proj-001",
        location_id="loc-001",
        activity_name="พิธีเปิด",
        activity_date="2026-01-10",
        start_time="09:00",
        end_time="10:00",
        description="พิธีเปิดกิจกรรมค่าย",
        facilitator_or_responsible="อาจารย์สมชาย",
    )

    assert activity.checklist_status == "Pending"
    assert activity.activity_name == "พิธีเปิด"

    activity.mark_done()
    assert activity.checklist_status == "Done"


def _schedules_overlap(first: SubActivity, second: SubActivity) -> bool:
    if first.location_id != second.location_id:
        return False
    return not (first.end_time <= second.start_time or second.end_time <= first.start_time)


# Given: ผู้ใช้ที่มีสิทธิ์จัดการมีกิจกรรมที่ใช้สถานที่เดียวกันแต่ช่วงเวลาไม่ซ้อนทับกันอยู่แล้ว;
# When: เพิ่มกิจกรรม C ในช่วง 11:30-12:00 ด้วยสถานที่เดียวกัน;
# Then: ระบบต้องยอมให้บันทึกกิจกรรม C ได้ เพราะช่วงเวลาไม่ซ้อนทับกันและตารางต้องแสดงทั้ง 3 กิจกรรมพร้อมสถานะ Pending

def test_TC_SCH_01_2_same_location_non_overlapping_allowed() -> None:
    activity_a = SubActivity(
        activity_id="act-101",
        project_id="proj-001",
        location_id="loc-001",
        activity_name="กิจกรรม A",
        activity_date="2026-01-10",
        start_time="09:00",
        end_time="10:00",
        description="กิจกรรมแรก",
        facilitator_or_responsible="คนที่ 1",
    )
    activity_b = SubActivity(
        activity_id="act-102",
        project_id="proj-001",
        location_id="loc-001",
        activity_name="กิจกรรม B",
        activity_date="2026-01-10",
        start_time="10:30",
        end_time="11:30",
        description="กิจกรรมที่สอง",
        facilitator_or_responsible="คนที่ 2",
    )
    activity_c = SubActivity(
        activity_id="act-103",
        project_id="proj-001",
        location_id="loc-001",
        activity_name="กิจกรรม C",
        activity_date="2026-01-10",
        start_time="11:30",
        end_time="12:00",
        description="กิจกรรมที่สาม",
        facilitator_or_responsible="คนที่ 3",
    )

    assert _schedules_overlap(activity_a, activity_b) is False
    assert _schedules_overlap(activity_b, activity_c) is False
    assert activity_a.checklist_status == "Pending"
    assert activity_b.checklist_status == "Pending"
    assert activity_c.checklist_status == "Pending"


# Given: ผู้ใช้ที่มีสิทธิ์จัดการกำลังเพิ่มกิจกรรมใหม่ แต่ละข้อมูลส่วนหนึ่งยังไม่ครบ เช่น รายละเอียดหรือผู้รับผิดชอบว่าง;
# When: กดบันทึก;
# Then: ระบบต้องปฏิเสธการบันทึกและไม่เพิ่มกิจกรรมใหม่; ข้อผิดพลาดต้องระบุว่าข้อมูลที่จำเป็นยังไม่ครบตาม FR-SCH-02

def test_TC_SCH_01_3_reject_incomplete_required_fields() -> None:
    with pytest.raises(ValueError, match="Missing required fields"):
        SubActivity(
            activity_id="act-104",
            project_id="proj-001",
            location_id="loc-001",
            activity_name="กิจกรรมไม่สมบูรณ์",
            activity_date="2026-01-10",
            start_time="13:00",
            end_time="14:00",
            description="",
            facilitator_or_responsible="",
        )
