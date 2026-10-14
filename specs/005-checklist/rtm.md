# RTM: จัดการตารางกิจกรรมและ checklist
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-14 00:00 | test: 4 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| CON-SCH-01 | - | T-03, T-05 | `backend/db/schema.sql` และ `backend/app/models/sub_activity.py: SubActivity.__post_init__` | `backend/tests/test_AC_SCH_01.py` (ผ่านเฉพาะ model validation); ยังไม่มี overlap service/transaction จริง | ยังไม่ถึง |
| CON-SCH-02 | - | T-01 | `backend/app/models/camp_project.py: CampProject`, `backend/app/models/camp_location.py: CampLocation`, `backend/db/schema.sql` | `backend/tests/test_schedule_task_t01.py` (ผ่าน) | ยังไม่ถึง |
| CON-SCH-03 | - | T-01, T-02 | `backend/app/models/user_permission.py: UserPermission.can_edit_schedule` | ไม่มี test จริงสำหรับสิทธิ์การเข้าถึงและการป้องกัน API/UI | ยังไม่ถึง |
| FR-SCH-01 | AC-SCH-01 | T-03, T-04 | `backend/app/models/sub_activity.py: SubActivity`, `backend/app/models/__init__.py` | `backend/tests/test_AC_SCH_01.py` (ผ่านเฉพาะสถานะและ validation model) | ยังไม่ถึง |
| FR-SCH-02 | AC-SCH-01 | T-03, T-04 | `backend/app/models/sub_activity.py: SubActivity.__post_init__` | `backend/tests/test_AC_SCH_01.py::test_TC_SCH_01_3_reject_incomplete_required_fields` (ผ่าน) | ยังไม่ถึง |
| FR-SCH-03 | AC-SCH-01 | T-03, T-05 | ไม่มี validator/overlap logic จริงใน `backend/app/` | ไม่มี test สำหรับ overlap service/validation | ยังไม่ถึง |
| FR-SCH-04 | AC-SCH-02 | T-05, T-06 | ไม่มีข้อความแจ้งเตือน/field error จริงใน `backend/app/` หรือ `frontend/src/` | ไม่มี test สำหรับ overlap rejection/field errors | ยังไม่ถึง |
| FR-SCH-05 | AC-SCH-01 | T-03, T-05 | `backend/app/models/sub_activity.py: SubActivity.mark_done`, `mark_pending` | `backend/tests/test_AC_SCH_01.py` (ผ่านเฉพาะ mark_done / pending) | ยังไม่ถึง |
| NFR-PERF-01 | - | T-05, T-06 | ไม่มี service/transaction implementation จริง | ไม่มี benchmark/benchmark test | ยังไม่ถึง |
| NFR-SEC-01 | - | T-02, T-04, T-06 | `backend/app/models/user_permission.py: UserPermission.can_edit_schedule` | ไม่มี test สำหรับผู้มีสิทธิ์/ไม่มีสิทธิ์ | ยังไม่ถึง |
| NFR-REL-01 | - | T-03, T-05 | `backend/db/schema.sql` มี `CHECK` และ FK แต่ไม่มี transaction wrapper หรือ rollback logic จริง | ไม่มี test สำหรับ transaction/rollback | ยังไม่ถึง |
| AC-SCH-01 | AC-SCH-01 | T-03, T-04 | ส่วนใหญ่ยังเป็น model/schema สร้างใช้ได้ภายใน backend และ test model-level | `backend/tests/test_AC_SCH_01.py` (3 tests, ผ่าน 3/3) | ยังไม่ถึง |
| AC-SCH-02 | AC-SCH-02 | T-05, T-06 | ไม่มี overlap validator หรือ UI error handling จริง | ไม่มี test ที่ตรวจ rejection ของซ้อนทับแบบ end-to-end | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/models/sub_activity.py: SubActivity.__post_init__` | FR-SCH-02, FR-SCH-05, CON-SCH-01 | บางส่วน | ตรวจว่า required field, status, และเวลาเริ่ม-สิ้นสุด ถูกต้อง แต่ยังไม่มี overlap check หรือ transaction จริง |
| `backend/app/models/user_permission.py: UserPermission.can_edit_schedule` | CON-SCH-03, NFR-SEC-01 | บางส่วน | มีโครงสร้างสิทธิ์ แต่ไม่มี middleware/API/UI ที่ป้องกันการแก้ไขจริง |
| `backend/db/schema.sql` | CON-SCH-02, CON-SCH-01, NFR-REL-01 | บางส่วน | กำหนด FK, CHECK และ schema ของตาราง แต่ไม่มี logic หรือ transaction wrapper สำหรับบันทึกกิจกรรมและ rollback |
| `backend/tests/test_AC_SCH_01.py` | AC-SCH-01, FR-SCH-01, FR-SCH-02, FR-SCH-05 | บางส่วน | ทดสอบ model validation, status Pending/Done และ required-field rejection ได้ แต่ยังไม่ครอบคลุมระบบ Schedule Management แบบ end-to-end |
| `frontend/src/__tests__/TC-SCH-01-*.test.jsx` | AC-SCH-01 | บางส่วน | เป็นสคริปต์ทดสอบ UI ที่ตั้งค่าไว้ แต่ repo ไม่มี frontend package/tooling จึงไม่สามารถรันจริงได้ |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
