# Tasks: ดูกำหนดและกิจกรรม (Schedule & Announcement)

- Feature: UC-12 ดูกำหนดและกิจกรรม
- Spec ID: 012-schedule
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-11-09

สรุป:
- เฟสทั้งหมด: 4 เฟส (เฟส 0 ถึงเฟส 3)
- งานย่อย: 8 tasks, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (เผยแพร่ค่ายที่อนุมัติและแสดงข้อมูลแก่ผู้ใช้)

## เฟส 0: ฐานรากข้อมูลค่ายและ API

### T-01 สร้างโมเดลและตารางข้อมูลประกาศค่าย
- รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-04, FR-SCH-05, ASM-SCH-02, ASM-SCH-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02 ถึง T-08
- ไฟล์ที่แตะ: `backend/app/models/camp_project.py`, `backend/db/schema.sql`, `backend/tests/test_schedule_announcement_schema.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: Model/Schema เก็บข้อมูลค่าย 4 ส่วน สถานะอนุมัติจากอาจารย์ และสถานะ “รออนุมัติ”/“เผยแพร่แล้ว” ได้ โดยไม่ถือโครงการที่ยังไม่อนุมัติว่าเผยแพร่แล้ว
- สถานะ: พร้อมทำ

### T-02 สร้าง API รายการและรายละเอียดสำหรับคณะกรรมการ
- รองรับ: FR-SCH-01, FR-SCH-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 ถึง T-08
- ไฟล์ที่แตะ: `backend/app/api/camp_announcements.py`, `backend/app/services/camp_announcement_service.py`, `backend/main.py`, `backend/tests/test_schedule_announcement_read_api.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: API คืนรายการโครงการและรายละเอียด 4 ส่วนให้คณะกรรมการเลือกตรวจทานได้
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_schedule_announcement_schema`, `test_schedule_announcement_read_api`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload`; frontend `npm --prefix frontend run dev`
- คนลองเองตามฐานราก:
  Given มีข้อมูลโครงการค่ายพร้อมรายละเอียด กำหนดการ สถานที่ และกิจกรรม
  When คณะกรรมการเรียกดูรายการและรายละเอียดโครงการ
  Then เห็นโครงการและข้อมูลทั้ง 4 ส่วนเพื่อทบทวนก่อนเผยแพร่
- ยังขาด: ไม่มี

## เฟส 1: เผยแพร่โครงการที่อนุมัติแล้ว (AC-SCH-01)

### T-03 ตรวจข้อมูลครบและเผยแพร่โครงการที่อนุมัติแล้ว
- รองรับ: FR-SCH-03, FR-SCH-04, FR-SCH-05, AC-SCH-01 และข้อกำหนดข้อมูลครบ 4 ส่วนใน spec (ไม่มี ID)
- ตรวจด้วย: AC-SCH-01
- ไฟล์ที่แตะ: `backend/app/api/camp_announcements.py`, `backend/app/services/camp_announcement_service.py`, `backend/tests/test_AC_SCH_01.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `test_AC_SCH_01_publish_approved_complete_camp` ยืนยันว่าข้อมูลครบและสถานะอนุมัติแล้วจึงเปลี่ยนเป็น “เผยแพร่แล้ว”
- สถานะ: พร้อมทำ

### T-04 สร้างหน้าคณะกรรมการเผยแพร่และหน้านักศึกษาดูค่าย
- รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-03, FR-SCH-05, FR-SCH-06, AC-SCH-01 และข้อกำหนด Responsive Design ใน spec (ไม่มี ID)
- ตรวจด้วย: AC-SCH-01
- ไฟล์ที่แตะ: `frontend/src/pages/CampAnnouncementPage.jsx`, `frontend/src/pages/PublishedCampPage.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_SCH_01.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_SCH_01_publish_approved_complete_camp_ui` ผ่านด้วย mock client และหลังเผยแพร่ผู้ใช้เห็นค่ายบนหน้าเว็บ
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_schedule_announcement_schema`, `test_schedule_announcement_read_api`, `test_AC_SCH_01_publish_approved_complete_camp` (API และ UI)
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-SCH-01:
  Given ข้อมูลค่ายทั้ง 4 ส่วนครบถ้วนและโครงการผ่านการอนุมัติ
  When คณะกรรมการกด “เผยแพร่ประกาศ”
  Then สถานะเปลี่ยนเป็น “เผยแพร่แล้ว” และนักศึกษามองเห็นข้อมูลค่ายบนหน้าเว็บ
- ยังขาด: ไม่มี

## เฟส 2: ปฏิเสธการเผยแพร่โครงการที่รออนุมัติ (AC-SCH-02)

### T-05 ปฏิเสธการเผยแพร่เมื่อยังไม่ได้รับอนุมัติ
- รองรับ: FR-SCH-04, FR-SCH-07, AC-SCH-02 และข้อกำหนดให้เผยแพร่ได้ต่อเมื่ออนุมัติแล้วใน spec (ไม่มี ID)
- ตรวจด้วย: AC-SCH-02
- ไฟล์ที่แตะ: `backend/app/api/camp_announcements.py`, `backend/app/services/camp_announcement_service.py`, `backend/tests/test_AC_SCH_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_SCH_02_reject_pending_approval` ยืนยันว่าคำขอถูกปฏิเสธและสถานะคงเป็น “รออนุมัติ”
- สถานะ: พร้อมทำ

### T-06 แสดง Pop-up เมื่อโครงการยังรออนุมัติ
- รองรับ: FR-SCH-07, AC-SCH-02
- ตรวจด้วย: AC-SCH-02
- ไฟล์ที่แตะ: `frontend/src/pages/CampAnnouncementPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_SCH_02.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-04, T-05
- เสร็จเมื่อ: `test_AC_SCH_02_reject_pending_approval_ui` ผ่านด้วย mock client โดยแสดงข้อความ Pop-up ตาม spec และไม่เปลี่ยนสถานะ
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: tests ของเฟส 0–1 และ `test_AC_SCH_02_reject_pending_approval`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-SCH-02:
  Given โครงการมีสถานะ “รออนุมัติ” และยังไม่ได้รับอนุมัติจากอาจารย์
  When คณะกรรมการกด “เผยแพร่ประกาศ”
  Then ระบบแสดง Pop-up ตามข้อความใน spec ปฏิเสธการเผยแพร่ และคงสถานะ “รออนุมัติ”
- ยังขาด: ไม่มี

## เฟส 3: นักศึกษาเปิดดูเฉพาะค่ายที่เผยแพร่แล้ว (AC-SCH-03)

### T-07 สร้าง API ค้นหาและอ่านรายละเอียดค่ายที่เผยแพร่แล้ว
- รองรับ: FR-SCH-06, AC-SCH-03, ASM-SCH-06
- ตรวจด้วย: AC-SCH-03
- ไฟล์ที่แตะ: `backend/app/api/camp_announcements.py`, `backend/app/services/camp_announcement_service.py`, `backend/tests/test_AC_SCH_03.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_SCH_03_student_view_published_camp` ยืนยันว่า API คืนเฉพาะค่ายสถานะ “เผยแพร่แล้ว” พร้อมข้อมูลทั้ง 4 ส่วน
- สถานะ: พร้อมทำ

### T-08 แสดงรายการและรายละเอียดค่ายที่เผยแพร่แล้ว
- รองรับ: FR-SCH-06, AC-SCH-03, ASM-SCH-06 และข้อกำหนด Responsive Design ใน spec (ไม่มี ID)
- ตรวจด้วย: AC-SCH-03
- ไฟล์ที่แตะ: `frontend/src/pages/PublishedCampPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_SCH_03.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-04, T-07
- เสร็จเมื่อ: `test_AC_SCH_03_student_view_published_camp_ui` ผ่านด้วย mock client โดยนักศึกษาเปิดดูรายละเอียด กำหนดการ สถานที่ และกิจกรรมได้
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: tests ของเฟส 0–2 และ `test_AC_SCH_03_student_view_published_camp`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-SCH-03:
  Given ค่ายมีสถานะ “เผยแพร่แล้ว”
  When นักศึกษาเปิดหน้าค้นหาหรือเข้าชมข้อมูลค่าย
  Then นักศึกษาเห็นและเปิดดูรายละเอียด กำหนดการ สถานที่ และกิจกรรมได้
- ยังขาด: ไม่มี

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-SCH-01 | T-03, T-04 |
| AC-SCH-02 | T-05, T-06 |
| AC-SCH-03 | T-07, T-08 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| ไม่มี ID: เผยแพร่ได้ต่อเมื่อโครงการอนุมัติแล้ว | T-03, T-05 |
| ไม่มี ID: ข้อมูลทั้ง 4 ส่วนต้องครบและไม่มีฟิลด์ว่างก่อนเผยแพร่ | T-03 |
| ไม่มี ID: หน้าแสดงข้อมูลรองรับ Responsive Design | T-04, T-08 |
| ไม่มี ID: Availability 24 ชั่วโมง | T-07, T-08 |
| ไม่มี ID: โหลดรายละเอียดและภาพภายใน 2 วินาที | T-07, T-08 |
| ไม่มี ID: กำหนดการ/กิจกรรมอ่านง่ายและเรียงตามเวลา | T-08 |

### Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-SCH-01 | AC-SCH-01 | เฟส 0–1 |
| FR-SCH-02 | AC-SCH-01 | เฟส 0–1 |
| FR-SCH-03 | AC-SCH-01 | เฟส 1 |
| FR-SCH-04 | AC-SCH-01, AC-SCH-02 | เฟส 1–2 |
| FR-SCH-05 | AC-SCH-01 | เฟส 1 |
| FR-SCH-06 | AC-SCH-01, AC-SCH-03 | เฟส 1, 3 |
| FR-SCH-07 | AC-SCH-02 | เฟส 2 |

## สิ่งที่ยังไม่ทำ

ไม่มี Open Questions ใน spec.md ฉบับ Draft v2; จึงไม่มี task ที่รอคำตอบ
