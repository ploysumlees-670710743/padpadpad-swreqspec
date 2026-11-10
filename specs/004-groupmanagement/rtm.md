# RTM: จัดกลุ่มและฝ่ายงาน (Group Management)

อ้างอิง: [spec.md](./spec.md) Draft v2 | [tasks.md](./tasks.md) | ไม่มี test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-21 07:13 UTC | test: 0 ผ่าน 2 ไม่ผ่าน (pytest collection errors; frontend test เริ่มไม่ได้)

หมายเหตุการตรวจ: ไม่พบโค้ด Group Management ใน `backend/app/` หรือ `frontend/src/`; task ที่ทำเสร็จมีเพียง T-01 ซึ่งเป็นการบันทึกการตัดสินใจเทคโนโลยี ไม่ใช่ implementation. ไม่พบ `specs/000-shared/`, mockup HTML หรือ UI section ใน spec.

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-GRP-01 | AC-GRP-01 | T-04, T-05 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-01; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-02 | AC-GRP-01 | T-04, T-05 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-01; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-03 | AC-GRP-02 | T-06 (พร้อมทำ), T-11/T-12 (รอเกณฑ์ CON-GRP-05), T-13 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-02; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-04 | AC-GRP-01 | T-04, T-05 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-01; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-05 | AC-GRP-03 | T-09, T-10 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-03; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-06 | AC-GRP-03 | T-09, T-10 (พร้อมทำบางส่วน), T-14 (รอ Q-01) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-03; pytest เก็บ test ไม่ได้ | รอ Q-01 |
| FR-GRP-07 | AC-GRP-03 | T-09, T-10 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-03; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-08 | AC-GRP-04 | T-07, T-08 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-04; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-09 | AC-GRP-04 | T-07, T-08 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-04; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| FR-GRP-10 | AC-GRP-04 | T-07, T-08 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ของ AC-GRP-04; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| CON-GRP-01 | AC-GRP-01, AC-GRP-02 | T-04, T-06 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจ constraint นี้ | ยังไม่ถึง |
| CON-GRP-02 | AC-GRP-01, AC-GRP-04 | T-04, T-07 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจ role ของ Group Management | ยังไม่ถึง |
| CON-GRP-03 | AC-GRP-01, AC-GRP-02, AC-GRP-04 | T-02, T-06, T-07 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจการสังกัดบ้านไม่เกินหนึ่งบ้าน | ยังไม่ถึง |
| CON-GRP-04 | AC-GRP-01, AC-GRP-04 | T-02, T-04, T-07 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจบ้าน/ฝ่ายงานของกรรมการ | ยังไม่ถึง |
| CON-GRP-05 | AC-GRP-02 | T-11/T-12 (รอทีมกำหนดเกณฑ์), T-13 (พร้อมทำ) | ยังไม่มีโค้ด Group Management; ยังไม่มีสูตรสมดุลที่ทีมอนุมัติ | ไม่มี test; เกณฑ์ผ่านยังตัดสินไม่ได้ | ยังไม่ถึง |
| CON-GRP-06 | AC-GRP-01, AC-GRP-02 | T-04, T-06, T-12 (พร้อมทำ/รอเกณฑ์) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจลำดับจัดสมาชิกหลักก่อนสุ่ม | ยังไม่ถึง |
| CON-GRP-07 | AC-GRP-03, AC-GRP-04 | T-02, T-07, T-09 (พร้อมทำ), T-14 (รอ Q-01) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจล็อกหลังประกาศ | ยังไม่ถึง |
| CON-GRP-08 | AC-GRP-04 | T-02, T-07, T-08 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจการยืนยันก่อนบันทึก | ยังไม่ถึง |
| IF-GRP-01 | AC-GRP-01, AC-GRP-02 | T-04, T-06 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจแหล่ง roster | ยังไม่ถึง |
| IF-GRP-02 | AC-GRP-01 | T-04 (พร้อมทำ) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจการใช้บ้าน/ฝ่ายงานที่มีอยู่ | ยังไม่ถึง |
| IF-GRP-03 | AC-GRP-02 | T-04, T-06 (พร้อมทำ), T-12 (รอเกณฑ์) | ยังไม่มีโค้ด Group Management | ไม่มี test ตรวจข้อมูลชั้นปี/เพศและการสุ่ม | ยังไม่ถึง |
| NFR-USE-01 | AC-GRP-03, AC-GRP-04 | T-05, T-08, T-10 (พร้อมทำ) | ยังไม่มีหน้าจอ Group Management | ไม่มี UI test ของ Group Management | ยังไม่ถึง |
| NFR-DATA-01 | AC-GRP-03 | T-01 (เสร็จ รอทีมตรวจ), T-02, T-07, T-09 (พร้อมทำ) | ยังไม่มีโมเดลหรือ persistence ของ Group Management | ไม่มี test ของ Group Management; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| NFR-SEC-01 | AC-GRP-01, AC-GRP-04 | T-04, T-05, T-07, T-08, T-10 (พร้อมทำ) | ยังไม่มีการควบคุมสิทธิ์ของ Group Management | ไม่มี test ของ Group Management; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |
| NFR-REL-01 | AC-GRP-02 | T-06, T-11/T-12, T-13 (พร้อมทำ/รอเกณฑ์) | ยังไม่มี service สุ่ม Group Management | ไม่มี test ของ AC-GRP-02; pytest เก็บ test ไม่ได้ | ยังไม่ถึง |

สรุปสถานะตาราง: ครบ 0 | ยังไม่ถึง 24 | รอ Q-xx 1 | ช่องโหว่ 0. ไม่มี FR ที่ขาด AC ใน spec; FR-GRP-01 ถึง FR-GRP-10 ถูก trace ไปยัง AC ตามตาราง Traceability ของ spec.

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/models/camp_project.py`: `CampProject.__post_init__` | FR-SCH-01, CON-SCH-02, CON-SCH-03 (คอมเมนต์ในโค้ด; ไม่ใช่ ID ของ SPEC-GRP-004) | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | โมเดล schedule แยกฟีเจอร์ ไม่ใช่โค้ด Group Management |
| `backend/app/models/camp_location.py`: `CampLocation.__post_init__` | FR-SCH-01, CON-SCH-01, CON-SCH-02 (คอมเมนต์ในโค้ด; ไม่ใช่ ID ของ SPEC-GRP-004) | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | โมเดล schedule แยกฟีเจอร์ ไม่ใช่โค้ด Group Management |
| `backend/app/models/sub_activity.py`: `SubActivity.__post_init__`, `mark_done`, `mark_pending` | FR-SCH-01, FR-SCH-02, FR-SCH-05, CON-SCH-01, CON-SCH-03 (คอมเมนต์ในโค้ด; ไม่ใช่ ID ของ SPEC-GRP-004) | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | โมเดล schedule แยกฟีเจอร์ ไม่ใช่โค้ด Group Management |
| `backend/app/models/user_permission.py`: `UserPermission.__post_init__`, `can_edit_schedule` | CON-SCH-03, NFR-SEC-01 (คอมเมนต์ในโค้ด; ไม่ใช่ ID ของ SPEC-GRP-004) | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | สิทธิ์ที่มีเป็นสิทธิ์จัดการตารางกิจกรรม ไม่ได้บังคับสิทธิ์ Group Management |
| `backend/app/models/__init__.py`: exports โมเดลตารางกิจกรรม | FR-SCH-* (อ้างผ่านโมเดลที่ export; ไม่ใช่ ID ของ SPEC-GRP-004) | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | ไม่มี export โมเดล Group Management |
| `backend/db/schema.sql`: `camp_projects`, `camp_locations`, `sub_activities`, `user_permissions` | FR-SCH-* / CON-SCH-* ในโมเดลที่เกี่ยวข้อง | ไม่ใช่ scope ของ spec ฟีเจอร์นี้ | ไม่มีตารางสังกัดบ้าน/ฝ่ายงาน; สคีมานี้เป็นของ schedule |
| `backend/app/__init__.py` | ไม่มี | ไม่มีพฤติกรรมฟีเจอร์ให้เทียบ | มีเพียง package docstring |
| `frontend/src/__tests__/TC-SCH-01-1.test.jsx`: `isValidActivity` และ test | TC-SCH-01-1 (schedule; ไม่ใช่ AC ของ SPEC-GRP-004) | ไม่ใช่โค้ด production และไม่ใช่ scope ของ spec ฟีเจอร์นี้ | test ตรวจ object จำลอง ไม่ได้เรียกหน้าจอ/API จริง |
| `frontend/src/__tests__/TC-SCH-01-2.test.jsx`: `schedulesOverlap` และ test | TC-SCH-01-2 (schedule; ไม่ใช่ AC ของ SPEC-GRP-004) | ไม่ใช่โค้ด production และไม่ใช่ scope ของ spec ฟีเจอร์นี้ | test ตรวจ helper จำลอง ไม่ได้เรียกหน้าจอ/API จริง |
| `frontend/src/__tests__/TC-SCH-01-3.test.jsx`: `isValidActivity` และ test | TC-SCH-01-3 (schedule; ไม่ใช่ AC ของ SPEC-GRP-004) | ไม่ใช่โค้ด production และไม่ใช่ scope ของ spec ฟีเจอร์นี้ | test ตรวจ helper จำลอง ไม่ได้เรียกหน้าจอ/API จริง |
| API endpoints ของ Group Management | ไม่มี | ไม่มี implementation | ไม่พบ endpoint ใน `backend/app/` |
| หน้าจอและ API client ของ Group Management | ไม่มี | ไม่มี implementation | ไม่พบโค้ด production ใน `frontend/src/` |

## 3. ข้อค้นพบ

ผลตามรอยไม่พบข้อค้นพบที่เข้าเกณฑ์ F-ID ในรอบนี้: requirement/AC ของ Group Management ยังไม่ถึง task implementation จึงไม่จัดเป็น "AC ไม่มี test" หรือ "โค้ดไม่มี FR" ตามข้อยกเว้นในขั้นตอนตรวจ. โค้ดที่มีเป็นของ schedule แยกฟีเจอร์และอ้าง ID `SCH`; ไม่จัดเป็นของแถมของ Group Management.

ข้อจำกัดการรันทดสอบ (บันทึกไว้เพื่อความโปร่งใส ไม่ใช่ F-ID):
- `cd backend && pytest -v`: ไม่สามารถเก็บ test ได้ 2 ไฟล์ เพราะ `ModuleNotFoundError: No module named 'backend'`; ไม่มี test ถูก execute.
- `cd frontend && npm test`: เริ่ม test ไม่ได้ เพราะไม่มี `frontend/package.json`.
- ไม่พบ test ของ AC-GRP-01 ถึง AC-GRP-04 และไม่มี task ที่เกี่ยวข้องกับ AC เหล่านี้อยู่ในสถานะ "เสร็จ" หรือ "เสร็จ รอทีมตรวจ" จึงยังไม่จัดเป็นข้อค้นพบชนิด AC ไม่มี test/test อ่อน.

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|

## 4. แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
