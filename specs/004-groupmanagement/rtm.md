# RTM: จัดกลุ่มและฝ่ายงาน (Group Management)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2026-10-18 08:19 | test: backend 0 ผ่าน 3 error, frontend ไม่สามารถรันได้ (ไม่มี package.json)

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| CON-GRP-01 | - | T-01, T-02 | `backend/db/schema.sql` และ `backend/app/models/participant.py: Participant` | `backend/tests/test_groupmanagement_task_t01.py` (ผ่านเฉพาะ model/schema พื้นฐาน; ยังไม่มีรายการผู้ผ่านคัดเลือกจริงและ filter ตามเงื่อนไข) | ยังไม่ถึง |
| CON-GRP-02 | - | T-03, T-04, T-09 | ไม่มี guard สำหรับคณะกรรมการใน backend หรือ frontend จริง | ไม่มี test | ยังไม่ถึง |
| CON-GRP-03 | - | T-09, T-10 | ไม่มี modal ยืนยัน / confirmation flow / history logic จริง | ไม่มี test | ยังไม่ถึง |
| IF-GRP-01 | - | T-01, T-02 | `backend/app/models/participant.py: Participant` มี field `selection_status` แต่ไม่มี list/filter ที่ดึงเฉพาะผู้ที่ผ่านคัดเลือกแล้ว | ไม่มี test | ยังไม่ถึง |
| IF-GRP-02 | - | T-01, T-03 | `backend/app/models/assignment.py: Assignment` มี validation type แต่ไม่มีรายการกลุ่ม/ฝ่ายที่มีอยู่จริงและการเชื่อม selection | ไม่มี test | ยังไม่ถึง |
| FR-GRP-01 | AC-GRP-01 | T-02, T-03 | ไม่มี API `GET /participants/eligible` หรือหน้า `ParticipantsListPage` จริงใน `backend/app/` / `frontend/src/` | ไม่มี test | ยังไม่ถึง |
| FR-GRP-02 | AC-GRP-01 | T-03 | ไม่มี logic เลือกผู้เข้าร่วมและจำกัดให้มีสังกัดได้เพียง 1 อย่างจริง | ไม่มี test | ยังไม่ถึง |
| FR-GRP-03 | AC-GRP-01 | T-03 | ไม่มี logic ตรวจเงื่อนไขกลุ่มหรือฝ่ายที่เลือกได้เพียงหนึ่งหน่วย และคณะกรรมการต้องมีสังกัดเดียว | ไม่มี test | ยังไม่ถึง |
| FR-GRP-04 | AC-GRP-02 | T-04, T-05, T-06 | ไม่มี `POST /participants/{id}/assignments` หรือ notification service จริง | ไม่มี test | ยังไม่ถึง |
| FR-GRP-05 | AC-GRP-03 | T-07, T-08 | ไม่มี display ของกลุ่ม/ฝ่ายปัจจุบันหรือสถานะ “จัดกลุ่มแล้ว” จริง | ไม่มี test | ยังไม่ถึง |
| FR-GRP-06 | AC-GRP-04 | T-09, T-10 | ไม่มี modal confirm change, history, หรือ logic history เก็บเมื่อเริ่มงาน/ประกาศงานแล้ว | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | - | T-03 | ไม่มี UI flow สำหรับคณะกรรมการจัดสังกัดตามลำดับขั้นตอนจริง | ไม่มี test | ยังไม่ถึง |
| NFR-DATA-01 | - | T-01, T-07, T-08 | `backend/app/models/participant.py` และ `backend/db/schema.sql` มี model/schema พื้นฐานแต่ยังไม่มี read/update current assignment จริง | `backend/tests/test_groupmanagement_task_t01.py` (ผ่านเฉพาะ model validation) | ยังไม่ถึง |
| NFR-SEC-01 | - | T-04, T-09 | ไม่มี guard สำหรับ committee-only action จริง | ไม่มี test | ยังไม่ถึง |
| AC-GRP-01 | AC-GRP-01 | T-02, T-03 | ไม่มี API/UI สำหรับ selection preview จริง | ไม่มี test | ยังไม่ถึง |
| AC-GRP-02 | AC-GRP-02 | T-04, T-05, T-06 | ไม่มี submit assignment / notify จริง | ไม่มี test | ยังไม่ถึง |
| AC-GRP-03 | AC-GRP-03 | T-07, T-08 | ไม่มี display current assignment + status “จัดกลุ่มแล้ว” จริง | ไม่มี test | ยังไม่ถึง |
| AC-GRP-04 | AC-GRP-04 | T-09, T-10 | ไม่มี modal confirm-change / history / notification จริง | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/models/participant.py: Participant` | CON-GRP-01, IF-GRP-01, NFR-DATA-01 | บางส่วน | มี field สำหรับ `selection_status`, `current_assignment_id`, `assignment_status` และ method `assign_to` แต่ยังไม่มี API/validation แบบ end-to-end สำหรับผู้เข้าร่วมที่ผ่านคัดเลือกแล้วหรือการย้ายสังกัด |
| `backend/app/models/assignment.py: Assignment` | IF-GRP-02, FR-GRP-03 | บางส่วน | มีการจำกัด `assignment_type` เป็น `group` หรือ `department` เท่านั้น แต่ไม่มีการจับคู่กับข้อมูลกลุ่ม/ฝ่ายจริงหรือ limitation ของคณะกรรมการ |
| `backend/db/schema.sql` | CON-GRP-01, IF-GRP-01, IF-GRP-02, NFR-DATA-01 | บางส่วน | มีตาราง `participants` และ `assignments` วางโครงสร้างพื้นฐานได้ แต่ยังไม่มีข้อมูลประวัติการย้าย/confirmation workflow, no committee-only enforcement, และ no joins/filter logic |
| `backend/tests/test_groupmanagement_task_t01.py` | T-01 | บางส่วน | ทดสอบแค่ model/schema พื้นฐานและการ assign แบบ local object มีความครอบคลุมต่ำมากและไม่ตรวจ AC ของฟีเจอร์นี้ |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-GRP-01 | AC ไม่มี test | `specs/004-groupmanagement/test-cases.md` และ `backend/tests/` | AC-GRP-01 ถึง AC-GRP-04 | ตาราง test cases ยังอยู่ในสถานะ “ร่าง” ทั้ง 3 แถว และ repo ไม่มี test ที่ตรวจ AC-GRP-01 ถึง AC-GRP-04 จริง จึงไม่มี traceability ที่ตรวจได้จริง | รอทีมตัดสิน |
| F-GRP-02 | โค้ดไม่มี FR | `backend/app/` และ `frontend/src/` | FR-GRP-01 ถึง FR-GRP-06 | โค้ดที่มีจริงเกี่ยวกับฟีเจอร์นี้เป็นแค่ model/schema พื้นฐานจาก T-01 เท่านั้น ไม่มี API, route, UI, หรือ notification logic ที่ทำให้ FR-GRP-01 ถึง FR-GRP-06 เป็นจริง | รอทีมตัดสิน |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
