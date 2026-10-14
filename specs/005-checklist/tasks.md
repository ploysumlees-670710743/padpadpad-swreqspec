# Tasks: จัดการตารางกิจกรรมและ checklist

- Feature: จัดการตารางกิจกรรมและ checklist (Schedule Management)
- Spec ID: SPEC-SCH-005
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-10-14

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 3 เฟส (เฟส 0, 1, 2)
- งานย่อย: 6 task, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (เพิ่มและติดตาม checklist สำเร็จ)

## เฟส 0: ฐานรากสำหรับตารางกิจกรรม (พื้นฐานร่วมทุกเฟส)

### T-01 สร้างโครงสร้างข้อมูลกิจกรรมและสิทธิ์
- รองรับ: CON-SCH-02, CON-SCH-03, FR-SCH-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: `backend/app/models/camp_project.py`, `backend/app/models/camp_location.py`, `backend/app/models/sub_activity.py`, `backend/app/models/user_permission.py`, `backend/db/schema.sql`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: โครงสร้างฐานข้อมูลและโมเดลกิจกรรมพร้อมเงื่อนไข precondition และสิทธิ์จัดการสามารถใช้งานได้โดย API ขั้นต่อไป
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้าง API ดูตารางและตรวจสิทธิ์ผู้ใช้
- รองรับ: FR-SCH-01, CON-SCH-03, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 และ T-04
- ไฟล์ที่แตะ: `backend/app/api/schedule.py`, `backend/app/middleware/authz.py`, `backend/app/services/schedule_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `GET /schedule` คืนข้อมูลกิจกรรมตามสิทธิ์ดูได้ และผู้ไม่มีสิทธิ์จัดการไม่สามารถเข้าถึงฟอร์มเพิ่ม/แก้ไข/ลบหรือเรียก API ที่เปลี่ยนแปลงข้อมูลได้
- สถานะ: เสร็จ รอทีมตรวจ

## เฟส 1: เพิ่มและติดตาม checklist สำเร็จ (AC-SCH-01)

### T-03 สร้าง API เพิ่ม/แก้ไข/ลบกิจกรรมและ checklist
- รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-03, FR-SCH-05, CON-SCH-01, CON-SCH-03, NFR-REL-01
- ตรวจด้วย: AC-SCH-01
- ไฟล์ที่แตะ: `backend/app/api/schedule.py`, `backend/app/services/schedule_service.py`, `backend/app/validators/activity_validator.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: POST/PUT/DELETE/PATCH สำหรับกิจกรรมย่อยทำงานได้ โดยข้อมูลบังคับครบ กิจกรรมใหม่เริ่มต้นเป็น `Pending` และสามารถเปลี่ยนสถานะเป็น `Done` ได้ผ่าน API และไม่สร้างความซ้ำซ้อนตามเงื่อนไข CON-SCH-01
- สถานะ: เสร็จ รอทีมตรวจ

### T-04 สร้างหน้า Schedule Management และฟอร์มกิจกรรม
- รองรับ: FR-SCH-01, FR-SCH-02, FR-SCH-05, CON-SCH-03, NFR-SEC-01
- ตรวจด้วย: AC-SCH-01
- ไฟล์ที่แตะ: `frontend/src/pages/ScheduleManagementPage.jsx`, `frontend/src/components/ActivityForm.jsx`, `frontend/src/components/ActivityTable.jsx`, `frontend/src/api/client.js`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: ผู้มีสิทธิ์จัดการเห็นตารางกิจกรรม สามารถเพิ่ม แก้ไข ลบ กิจกรรมย่อย และเห็น checklist status เป็น `Pending`/`Done` จากหน้าจอจริง
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_SCH_01_create_activity_and_track_checklist`
- เปิดระบบ: ตาม plan.md ใช้ FastAPI backend และ React frontend ที่เรียก `frontend/src/api/client.js`
- คนลองเองตาม AC-SCH-01:
  Given ผู้ใช้ที่มีสิทธิ์จัดการเปิดหน้าจัดการตารางกิจกรรมและมีข้อมูลโครงการค่าย/สถานที่ที่พร้อมใช้งาน
  When กรอกชื่อกิจกรรม วัน ช่วงเวลา สถานที่ รายละเอียด และผู้รับผิดชอบครบถ้วน แล้วกดบันทึก
  Then ระบบบันทึกกิจกรรมเข้าสู่ตารางค่าย แสดงสถานะ checklist เป็น `Pending` และสามารถเปลี่ยนสถานะเป็น `Done`
- ยังขาด: ไม่มี

## เฟส 2: ปฏิเสธกิจกรรมที่ซ้อนทับและแสดงข้อผิดพลาดจากข้อมูล (AC-SCH-02)

### T-05 สร้างตรวจซ้ำเวลา-สถานที่และ rollback transaction
- รองรับ: FR-SCH-03, FR-SCH-04, FR-SCH-05, CON-SCH-01, NFR-PERF-01, NFR-REL-01
- ตรวจด้วย: AC-SCH-02
- ไฟล์ที่แตะ: `backend/app/services/schedule_service.py`, `backend/app/validators/activity_validator.py`, `backend/app/db/transaction.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: กรณีใช้สถานที่เดียวกันและช่วงเวลาซ้อนทับ ระบบปฏิเสธการบันทึก และการบันทึกใช้ Database Transaction พร้อม rollback เมื่อเกิดความผิดพลาดหรือข้อมูลไม่ครบ โดยต้องตอบสนอง p95 <= 1 วินาที ตาม NFR-PERF-01
- สถานะ: พร้อมทำ

### T-06 สร้างข้อผิดพลาดบริเวณฟิลด์และทดสอบ AC-SCH-02
- รองรับ: FR-SCH-04, CON-SCH-01, NFR-PERF-01, NFR-SEC-01
- ตรวจด้วย: AC-SCH-02
- ไฟล์ที่แตะ: `frontend/src/pages/ScheduleManagementPage.jsx`, `frontend/src/components/ActivityForm.jsx`, `frontend/src/api/client.js`, `backend/tests/test_schedule_overlap.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04, T-05
- เสร็จเมื่อ: ข้อผิดพลาดความซ้ำซ้อนแสดงบริเวณฟิลด์ช่วงเวลา/สถานที่ และ test_AC_SCH_02_reject_overlapping_activity_with_field_errors ผ่าน
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_SCH_01_create_activity_and_track_checklist`, `test_AC_SCH_02_reject_overlapping_activity_with_field_errors`
- เปิดระบบ: ตาม plan.md ใช้ FastAPI backend และ React frontend ที่เรียก `frontend/src/api/client.js`
- คนลองเองตาม AC-SCH-02:
  Given ผู้มีสิทธิ์จัดการมีกิจกรรมเดิมที่ใช้สถานที่เดียวกันอยู่แล้ว และกำลังเพิ่มหรือแก้ไขกิจกรรมย่อยใหม่
  When กรอกช่วงเวลาและสถานที่ที่ซ้อนทับกับกิจกรรมเดิม
  Then ระบบปฏิเสธการบันทึกและแสดงข้อความแจ้งเตือนที่ช่องข้อมูลช่วงเวลา/สถานที่เพื่อให้แก้ไขก่อนบันทึก
- ยังขาด: ไม่มี

## ตารางตรวจความครบ

### 1) AC ID | task ที่ตรวจ AC นี้

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-SCH-01 | T-03, T-04 |
| AC-SCH-02 | T-05, T-06 |

### 2) Constraint ID | task ที่ทำให้เป็นจริง

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-SCH-01 | T-03, T-05, T-06 |
| CON-SCH-02 | T-01 |
| CON-SCH-03 | T-01, T-02, T-03, T-04 |
| NFR-PERF-01 | T-05, T-06 |
| NFR-SEC-01 | T-02, T-03, T-04, T-06 |
| NFR-REL-01 | T-03, T-05 |

### 3) FR ID | AC ที่ตรวจ FR นี้ | เฟส

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-SCH-01 | AC-SCH-01 | เฟส 1 |
| FR-SCH-02 | AC-SCH-01 | เฟส 1 |
| FR-SCH-03 | AC-SCH-01 | เฟส 1 |
| FR-SCH-04 | AC-SCH-02 | เฟส 2 |
| FR-SCH-05 | AC-SCH-01 | เฟส 1 |

## สิ่งที่ยังไม่ทำ
- ไม่มี Open Questions ใน spec v2 ของ feature นี้；ไม่มี task ที่รอ Q-xx
- ข้อมูลโครงการค่ายและสถานที่จัดค่ายยังคงเป็น Precondition ตาม CON-SCH-02 และ ASM-01 จึงไม่ได้จัด task สร้างข้อมูลใหม่
- การแจ้งเตือนแบบเรียลไทม์หรือประกาศผลยังอยู่ใน Out of scope ตาม spec และไม่มี task สำหรับสิ่งเหล่านี้
