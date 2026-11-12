# RTM: จัดการตารางกิจกรรมและ checklist
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09 10:29 | test: 98 ผ่าน 13 ไม่ผ่าน (Backend: 78 ผ่าน, 2 ไม่ผ่าน; Frontend: 20 ผ่าน, 11 ไม่ผ่าน)

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| CON-SCH-01 | - | T-03, T-05 | `backend/app/services/schedule_service.py: _require_unique_schedule_slot`, `backend/app/validators/activity_validator.py: validate_activity_payload` | `backend/tests/test_AC_SCH_01.py` (ผ่าน), `backend/tests/test_schedule_overlap.py` (ผ่าน), `backend/tests/test_AC_SCH_02.py` (ผ่าน) | ครบ |
| CON-SCH-02 | - | T-01 | `backend/app/models/camp_project.py`, `backend/app/models/camp_location.py`, `backend/db/schema.sql` | `backend/tests/test_schedule_task_t01.py` (ผ่าน) | ครบ |
| CON-SCH-03 | - | T-02, T-03, T-04 | `backend/app/middleware/authz.py`, `backend/app/middleware/auth.py`, `frontend/src/pages/ScheduleManagementPage.jsx` | `backend/tests/test_schedule_task_t02.py` (ในชุดย่อยผ่าน), `frontend/src/__tests__/TC-SCH-02-1.test.jsx` (ผ่าน) | ครบ |
| FR-SCH-01 | AC-SCH-01 | T-02, T-03, T-04 | `backend/app/api/schedule.py: read_schedule`, `backend/app/services/schedule_service.py: get_schedule_for_user`, `frontend/src/pages/ScheduleManagementPage.jsx` | `backend/tests/test_schedule_task_t02.py` (กรณีย่อยผ่าน), `backend/tests/test_AC_SCH_01.py` (ผ่าน), `frontend/src/__tests__/TC-SCH-02-1.test.jsx` (ผ่าน) | ช่องโหว่ |
| FR-SCH-02 | AC-SCH-01 | T-03, T-04 | `backend/app/validators/activity_validator.py: validate_activity_payload`, `frontend/src/components/ActivityForm.jsx` | `backend/tests/test_AC_SCH_01.py` (ผ่าน), `frontend/src/__tests__/ScheduleManagementPage.test.jsx` (ผ่าน) | ครบ |
| FR-SCH-03 | AC-SCH-01, AC-SCH-02 | T-03, T-05 | `backend/app/services/schedule_service.py: _require_unique_schedule_slot` | `backend/tests/test_schedule_overlap.py` (ผ่าน), `backend/tests/test_AC_SCH_02.py` (ผ่าน) | ครบ |
| FR-SCH-04 | AC-SCH-02 | T-06 | `frontend/src/pages/ScheduleManagementPage.jsx`, `frontend/src/components/ActivityForm.jsx` | `frontend/src/__tests__/TC-SCH-02-1.test.jsx` (ผ่าน) | ครบ |
| FR-SCH-05 | AC-SCH-01 | T-03, T-05 | `backend/app/services/schedule_service.py: create_activity`, `patch_activity_checklist` | `backend/tests/test_AC_SCH_01.py` (ผ่าน), `backend/tests/test_schedule_overlap.py` (ผ่าน) | ครบ |
| NFR-PERF-01 | - | T-05 | `backend/app/services/schedule_service.py` | ไม่มี benchmark หรือ timing assertion จริงใน repo | ยังไม่ถึง |
| NFR-SEC-01 | - | T-02, T-03, T-04 | `backend/app/middleware/authz.py`, `backend/app/middleware/auth.py`, `frontend/src/pages/ScheduleManagementPage.jsx` | `backend/tests/test_schedule_task_t02.py` (ผ่านในกรณีย่อย) | ครบ |
| NFR-REL-01 | - | T-05 | `backend/app/db/transaction.py`, `backend/app/services/schedule_service.py` | `backend/tests/test_schedule_overlap.py` (ผ่าน) | ครบ |
| AC-SCH-01 | AC-SCH-01 | T-03, T-04 | `backend/app/api/schedule.py`, `backend/app/services/schedule_service.py`, `frontend/src/pages/ScheduleManagementPage.jsx` | `backend/tests/test_AC_SCH_01.py` (4/4 ผ่าน), `frontend/src/__tests__/ScheduleManagementPage.test.jsx` (ผ่าน) | ครบ |
| AC-SCH-02 | AC-SCH-02 | T-05, T-06 | `backend/app/services/schedule_service.py`, `frontend/src/pages/ScheduleManagementPage.jsx` | `backend/tests/test_AC_SCH_02.py` (3/3 ผ่าน), `backend/tests/test_schedule_overlap.py` (3/3 ผ่าน), `frontend/src/__tests__/TC-SCH-02-1.test.jsx` (3/3 ผ่าน) | ครบ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/schedule.py: read_schedule` | FR-SCH-01, CON-SCH-03, NFR-SEC-01 | ใช่ | คืนตารางตามสิทธิ์มุมมอง; ผู้ไม่มีสิทธิ์จัดการยังได้รับการป้องกัน |
| `backend/app/api/schedule.py: create_activity` | FR-SCH-02, FR-SCH-03, FR-SCH-04, CON-SCH-03 | ใช่ | ตรวจฟิลด์บังคับและซ้อนทับก่อนบันทึก |
| `backend/app/middleware/authz.py: require_schedule_manage_access` | CON-SCH-03, NFR-SEC-01 | ใช่ | ป้องกัน API create/update/delete/checklist สำหรับผู้ไม่ใช่ manager |
| `backend/app/services/schedule_service.py: _require_unique_schedule_slot` | FR-SCH-03, CON-SCH-01 | ใช่ | Yields overlap rejection for same date+location+time conflict |
| `backend/app/services/schedule_service.py: update_activity` | FR-SCH-03, FR-SCH-04 | ใช่ | ปฏิเสธการอัปเดตที่ทำให้ซ้อนทับกับกิจกรรมอื่นและคงข้อมูลเดิมไว้ |
| `backend/app/db/transaction.py: transaction` | NFR-REL-01 | ใช่ | มี rollback helper สำหรับ mutation context; ใช้กับ schedule writes |
| `frontend/src/pages/ScheduleManagementPage.jsx` | FR-SCH-01, FR-SCH-02, FR-SCH-04 | ใช่ | จัดการฟอร์ม เพิ่ม/แก้ไข/ลบ พร้อม field warning สำหรับ overlap |
| `frontend/src/components/ActivityForm.jsx` | FR-SCH-02, FR-SCH-04 | ใช่ | แสดงข้อความ error ต่อฟิลด์ `location_id`, `start_time`, `end_time` |
| `backend/app/services/schedule_service.py` | FR-SCH-01 | ไม่สมบูรณ์ | Shared in-memory store `_SCHEDULE_STORE` แบบ global ส่งผลให้บาง test จะติด state ระหว่างรัน และทำให้ `test_schedule_view_requires_can_view_schedule` fail ใน full suite |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-SCH-01 | test อ่อน / state leakage | `backend/app/services/schedule_service.py` | FR-SCH-01, NFR-SEC-01 | `_SCHEDULE_STORE` เป็น global mutable state และไม่ได้ reset ระหว่าง test ทำให้ `test_schedule_view_requires_can_view_schedule` fail เมื่อรัน full backend suite; sample result: ค่ากิจกรรมแรกกลับมาจาก state ที่เคย mutate ก่อนหน้า |  |
| F-ENR-01 | โค้ดไม่มี FR / AC ไม่มี test | `backend/db/schema.sql`, `tests/test_enrollment_schema_foundation.py` | spec ของ feature อื่น (Enrollment) ไม่ใช่ schedule แต่ full repo still red | `schema.sql` ใช้ `camp_projects` แทนชื่อตารางที่ test คาดว่า `camps` ทำให้ backend full suite fail แม้ไม่ได้เกี่ยวกับ schedule |  |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-SCH-01 | ยังไม่แก้ในงานนี้; ควร reset in-memory state หรือ seed per test | จากผล full backend suite: `test_schedule_view_requires_can_view_schedule` ล้มหลังมี prior mutation และค่า `activities[0].activity_name` เป็น "กิจกรรมเดิม" แทน "พิธีเปิด" |
| F-ENR-01 | ยังไม่แก้ในงานนี้; ไม่ใช่ scope ของ schedule feature | จาก full backend suite: `tests/test_enrollment_schema_foundation.py::test_enrollment_schema_foundation` fail ที่ assertion `CREATE TABLE IF NOT EXISTS camps` ใน `backend/db/schema.sql` |
