# Prompt log

บันทึกทุกครั้งที่ใช้ AI กับ repo นี้ เขียนต่อท้ายเรื่อย ๆ ไม่ต้องลบของเก่า

## 2026-11-09 คำสั่ง: แก้ F-01, F-02 และ F-10

- F-01: ขยาย AC-REG-01 และ TC-REG-01-1 ให้ตรวจว่าระบบแสดงข้อมูลเดิมครบทุกฟิลด์ก่อนแก้ไข
- F-02: เปลี่ยน `GET /applicants/{applicant_id}/edit` กรณีไม่พบผู้สมัครให้คืน 404 และเพิ่ม test
- F-10: เพิ่ม implementation ของ `GET /applicants/{applicant_id}/audit-log` ใน API/service และเพิ่ม test
- ปรับ T-03 และ RTM ให้ trace API audit-log

---

## 2026-09-20 15:00 คำสั่ง: /clarify

- เครื่องมือ: Copilot ใน Codespaces
- ไฟล์: specs/002-edit-applicant-information/spec.md (v1)

### คำถามที่ AI ถาม (ทั้งหมด)

1. ฟิลด์ใดบ้างในข้อมูลผู้สมัครที่อนุญาตให้แก้ไขได้ และฟิลด์ใดห้ามแก้ไขหรือต้องล็อกไว้?
2. มีช่วงเวลาหรือสถานะใดบ้างที่ปิดการแก้ไขข้อมูลผู้สมัคร เช่น หลังปิดรับสมัคร หรือเมื่อลงทะเบียนแล้ว?
3. กฎ validation สำหรับแต่ละฟิลด์ต้องใช้ตัวอย่างอะไรบ้าง เช่น เบอร์โทรศัพท์ อีเมล วันเกิด หรือชื่อ-นามสกุล?
4. Audit Log ต้องบันทึกแบบรายการต่อฟิลด์หรือแบบหนึ่งบันทึกต่อการกดยืนยันครั้งเดียว?
5. เมื่อมีข้อผิดพลาดในหลายฟิลด์ ระบบควรเน้นช่องใดก่อน และแสดงข้อความแบบใด?
6. เมื่อลูกค้าเลือก “ยกเลิก” หลังจากแก้ไขไปแล้ว ต้องคืนค่าอะไรกลับไปในฟอร์ม และต้องล้างสถานะการแก้ไขหรือไม่?

### คำตอบของทีมและเหตุผล

1. อนุยาติให้แก้ไขได้ทุกฟิลด์บนแพลตฟอร์ม แต่ต้องมีการบันทึก log ของการแก้ไขไว้ด้วย
2. ปิดการแก้ไขข้อมูลเมื่อเมื่อลงทะเบียนเสร็จสิ้นแล้ว
3. ตรวจสอบความและรูปแบบทั่วไป หากเป็นชื่อต้องไม่มีตัวเลข และหากเป็นเบอร์โทรศัพท์ต้องไม่มีตัวอักษร
4. บันทึกต่อการกดครั้งเดียวและเก็บค่าเดิมและค่าฟิลด์ที่เปลี่ยนใหม่
5. คืนค่าสถานะเดิมและปิดฟอร์มโดยไม่คงการแก้ไข

### สิ่งที่แก้ใน spec.md (v1 เป็น v2)

- ปรับคำอธิบาย FR-REG-01, FR-REG-02, FR-REG-04, FR-REG-05, FR-REG-06 ให้สอดคล้องกับคำตอบของทีม
- เพิ่ม Assumptions ใหม่เพื่อกำหนดให้แก้ไขได้ทุกฟิลด์บนแพลตฟอร์ม, ปิดการแก้ไขหลังลงทะเบียนเสร็จสิ้น, validation รูปแบบทั่วไป, และพฤติกรรมยกเลิก
- เปลี่ยน Status เป็น Draft v2 และอัปเดตวันที่เป็น 2569-09-20

---

## 2026-11-09 08:51 คำสั่ง: /tasks

- เครื่องมือ: Copilot ใน Codespaces
- ไฟล์: `specs/002-edit-applicant-information/tasks.md`
- ผลลัพธ์: แตก `plan.md` เป็น 4 เฟส 9 task ตาม AC-REG-01 ถึง AC-REG-03 โดยไม่มี task ที่รอ Open Questions
- ขอบเขต: ยังไม่เริ่มทำ task หรือเขียนโค้ด

---

## 2026-09-20 15:05 คำสั่ง: /plan

- เครื่องมือ: Copilot ใน Codespaces
- ผลลัพธ์: specs/002-edit-applicant-information/plan.md
- Constraint ที่ AI ยังไม่ได้ใช้: ไม่มี
- สิ่งที่ AI บอกว่าอยากเดาแต่ไม่ได้เดา: ไม่มี เนื่องจาก spec อยู่ใน Draft v2 และมีคำตอบครบตามต้องการแล้ว

---

## 2026-09-20 15:20 คำสั่ง: /clarify

- เครื่องมือ: Copilot ใน Codespaces
- ไฟล์: specs/010-camp-monitoring/spec.md (v1)

### คำถามที่ AI ถาม (ทั้งหมด)

1. ช่องทางแจ้งเตือนที่ใช้เมื่อมีประเด็นต้องแก้ไขและปัญหาร้ายแรงควรส่งผ่านช่องทางใดบ้าง?
2. คณะกรรมการที่ได้รับแจ้งเตือนควรเป็นใครบ้างสำหรับแต่ละค่าย?
3. “ประเด็นที่ต้องแก้ไข” และ “ปัญหาร้ายแรง” ต้องมีเกณฑ์อย่างไรจึงจะถือว่าเป็นเหตุการณ์ที่ต้องแจ้งเตือน?
4. ฟอร์มบันทึกผลการติดตามควรมีฟิลด์ขั้นต่ำอะไรบ้าง และการประเมินความเรียบร้อยใช้มาตรฐานใด?
5. เมื่อมีปัญหาร้ายแรง อาจารย์ต้องระบุข้อมูลอะไรบ้างในคำสั่งด่วน (Urgent Action) ก่อนส่ง?

### คำตอบของทีมและเหตุผล

1. ส่งผ่าน Notification ของระบบและ Email
2. เจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย
3. ยังไม่ได้ตอบ / ยังเป็นข้อตกลงที่ต้องถามต่อในภายหลัง
4. รายละเอียดกิจกรรม / ผลการดำเนินการ / ปัญหาที่เกิดขึ้น / ประเด็นที่ต้องแก้ไข
5. ยังไม่ได้ตอบ / ยังเป็นข้อตกลงที่ต้องถามต่อในภายหลัง

### สิ่งที่แก้ใน spec.md (v1 เป็น v2)

- ปรับ Goal, Scope, Constraints, Requirements, Acceptance Criteria และ Assumptions ให้สอดคล้องกับคำตอบที่ได้รับ
- ปรับกฎแจ้งเตือนให้ส่งผ่าน Notification ของระบบและ Email ไปยังเจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย
- ปรับฟอร์มบันทึกผลการติดตามให้รวมรายละเอียดกิจกรรม ผลการดำเนินการ ปัญหาที่เกิดขึ้น และประเด็นที่ต้องแก้ไข
- เปลี่ยน Status เป็น Draft v2 และอัปเดตวันที่เป็น 2569-09-20

---

## 2026-09-20 15:20 คำสั่ง: /clarify

- เครื่องมือ: Copilot ใน Codespaces
- ไฟล์: specs/010-camp-monitoring/spec.md (v1)

### คำถามที่ AI ถาม (ทั้งหมด)

1. ช่องทางแจ้งเตือนที่ใช้เมื่อมีประเด็นต้องแก้ไขและปัญหาร้ายแรงควรส่งผ่านช่องทางใดบ้าง?
2. คณะกรรมการที่ได้รับแจ้งเตือนควรเป็นใครบ้างสำหรับแต่ละค่าย?
3. “ประเด็นที่ต้องแก้ไข” และ “ปัญหาร้ายแรง” ต้องมีเกณฑ์อย่างไรจึงจะถือว่าเป็นเหตุการณ์ที่ต้องแจ้งเตือน?
4. ฟอร์มบันทึกผลการติดตามควรมีฟิลด์ขั้นต่ำอะไรบ้าง และการประเมินความเรียบร้อยใช้มาตรฐานใด?
5. เมื่อมีปัญหาร้ายแรง อาจารย์ต้องระบุข้อมูลอะไรบ้างในคำสั่งด่วน (Urgent Action) ก่อนส่ง?

### คำตอบของทีมและเหตุผล

1. ส่งผ่าน Notification ของระบบและ Email
2. เจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย
3. ยังไม่ได้ตอบ / ยังเป็นข้อตกลงที่ต้องถามต่อในภายหลัง
4. รายละเอียดกิจกรรม / ผลการดำเนินการ / ปัญหาที่เกิดขึ้น / ประเด็นที่ต้องแก้ไข
5. ยังไม่ได้ตอบ / ยังเป็นข้อตกลงที่ต้องถามต่อในภายหลัง

### สิ่งที่แก้ใน spec.md (v1 เป็น v2)

- ปรับ Goal, Constraints, Requirements และ Assumptions ให้สอดคล้องกับคำตอบที่ได้รับ
- ปรับกฎแจ้งเตือนให้ส่งผ่าน Notification ของระบบและ Email ไปยังเจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย
- ปรับฟอร์มบันทึกผลการติดตามให้รวมรายละเอียดกิจกรรม ผลการดำเนินการ ปัญหาที่เกิดขึ้น และประเด็นที่ต้องแก้ไข
- เปลี่ยน Status เป็น Draft v2 และอัปเดตวันที่เป็น 2569-09-20

---

---

## 2026-11-09 09:02 คำสั่ง: /implement T-01

- ไฟล์ที่สร้างหรือแก้: `backend/db/schema.sql`, `backend/app/models/applicant.py`, `backend/app/models/audit_log.py`, `backend/app/db/transaction.py`
- ผล test: `PYTHONPATH=. pytest -q backend/tests` ผ่าน 11 tests; ตรวจ model/schema/transaction เพิ่มเติมผ่าน
- สิ่งที่เกือบต้องเดา: `Applicant` เดิมถูกใช้กับ selection จึงเพิ่มฟิลด์ของ SPEC-REG-002 แบบ backward-compatible แทนการเปลี่ยน constructor เดิม
- ขอบเขต: ทำเฉพาะ T-01 และเปลี่ยนสถานะ T-01 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:05 คำสั่ง: /implement T-02

- ไฟล์ที่สร้างหรือแก้: `backend/app/main.py`, `backend/app/api/applicants.py`, `backend/app/models/user_account.py`, `backend/app/middleware/authz.py`, `backend/tests/test_applicant_permissions.py`
- ผล test: `PYTHONPATH=. pytest -q backend/tests/test_applicant_permissions.py` ผ่าน 3 tests; `PYTHONPATH=. pytest -q backend/tests` ผ่าน 14 tests
- สิ่งที่เกือบต้องเดา: ไม่มี; ยึด identity ที่ระบบยืนยันแล้วใน `request.state` ตามขอบเขตที่ไม่รวมการเข้าสู่ระบบ
- ขอบเขต: ทำเฉพาะ T-02 และเปลี่ยนสถานะ T-02 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:07 คำสั่ง: /implement T-03

- ไฟล์ที่สร้างหรือแก้: `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/app/validators/applicant_validator.py`, `backend/tests/test_AC_REG_01.py`; ใช้ helper เดิมใน `backend/app/db/transaction.py`
- ผล test: `PYTHONPATH=. pytest -q backend/tests/test_AC_REG_01.py` ผ่าน 1 test; regression `PYTHONPATH=. pytest -q backend/tests` ผ่าน 15 tests
- สิ่งที่เกือบต้องเดา: ไม่มี; ใช้ timezone `Asia/Bangkok` ตาม ASM-02 และแก้กรณีผู้สมัครไม่พบให้คง authorization route boundary เดิม เพราะ ASM-01 กำหนดว่าผู้สมัครมีอยู่แล้ว
- ขอบเขต: ทำเฉพาะ T-03 และเปลี่ยนสถานะ T-03 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:12 คำสั่ง: /implement T-04

- ไฟล์ที่สร้างหรือแก้: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx`, `frontend/src/api/client.js`, `frontend/src/main.jsx`
- ผล test: `cd frontend && npm run build` ผ่าน; `PYTHONPATH=. pytest -q backend/tests` ผ่าน 15 tests
- สิ่งที่เกือบต้องเดา: ไม่มี; spec ไม่มี mockup จึงใช้ชื่อฟิลด์จาก plan และเปิด route ตาม `/applicants/:id/edit`
- ขอบเขต: ทำเฉพาะ T-04 และเปลี่ยนสถานะ T-04 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:16 คำสั่ง: /testcases AC-REG-01

- โหมด: ร่าง
- ไฟล์: `specs/002-edit-applicant-information/test-cases.md`
- TC ID ที่เสนอ: `TC-REG-01-1`, `TC-REG-01-2`, `TC-REG-01-3`
- ผลลัพธ์: เสนอกรณีทางปกติ ขอบ และทางผิด สถานะทุกแถวยังเป็น `ร่าง`; ยังไม่เขียนโค้ด test
- ประเด็นที่ spec ไม่ได้บอก: กรณีส่งเบอร์โทรศัพท์เดิมซ้ำว่าจะต้องสร้างหรือไม่สร้าง Audit Log; ระบุไว้ใน Then และต้องให้ทีมตัดสินใจก่อนเปลี่ยนเป็น `ใช้ได้`

---

## 2026-11-09 09:19 คำสั่ง: /verify specs/002-edit-applicant-information

- ไฟล์ที่อ่านตรวจ: `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, โค้ดใน `backend/app/` และ `frontend/src/`, test ใน `backend/tests/` และ `frontend/src/__tests__/`
- ผล test: backend ผ่าน 15 tests, ไม่ผ่าน 0 tests; frontend test runner รันไม่ได้เพราะไม่มี Vitest และไม่มี test หน้าจอของ Applicant Edit
- จำนวนแถวตามรอยไปข้างหน้า: `ครบ` 3, `ยังไม่ถึง` 4, `รอ Q-xx` 0, `ช่องโหว่` 5
- ข้อค้นพบใหม่: F-01 ถึง F-07
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 19:11 คำสั่ง: แก้ F-11 ถึง F-15

- F-11: เพิ่ม `test_TC_REG_03_3_cancel_without_changes`
- F-12: เพิ่มการค้นหาผู้สมัครด้วยรหัสหรือชื่อ ผ่าน API, client และ `ApplicantSearchPage`
- F-13: ปฏิเสธการแก้ไขเมื่อ `status=completed`
- F-14: เพิ่ม retention policy 3 เดือนด้วย `retention_until`
- F-15: เพิ่ม frontend assertions ตรวจชื่อ อีเมล ที่อยู่ และสถานะเดิมก่อนแก้ไข
- ผล test: backend `PYTHONPATH=.. pytest -q` ผ่าน 34 tests; frontend `npm test -- --run` ผ่าน 7 tests; build ผ่าน
- RTM: ย้าย F-11 ถึง F-15 ไปหัวข้อ `แก้แล้ว`

---

## 2026-11-09 19:16 คำสั่ง: /verify spec/002-edit-applicant-information

- ผล `cd backend && pytest -v`: เก็บ test ไม่ได้ 10 errors เพราะ `ModuleNotFoundError: No module named 'backend'` จาก import path
- ผล `cd backend && PYTHONPATH=.. pytest -q`: backend ผ่าน 34 tests, ไม่ผ่าน 0 tests
- ผล `cd frontend && npm test`: frontend ผ่าน 7 tests จาก 4 test files, ไม่ผ่าน 0 tests
- จำนวนแถวตามรอยไปข้างหน้า: ครบ 9, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 0
- ข้อค้นพบใหม่: F-16 API/หน้าค้นหาไม่ได้อยู่ใน plan/tasks เดิม; F-17 test retention ยังตรวจไม่ครบ 3 เดือน; F-18 schema initialization ไม่มี migration สำหรับฐานข้อมูลเดิมที่ยังไม่มี `retention_until`
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 09:23 คำสั่ง: /implement T-05 specs/002-edit-applicant-information/task.md

- ไฟล์ที่สร้างหรือแก้: `backend/app/validators/applicant_validator.py`, `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/tests/test_AC_REG_02.py`, `specs/002-edit-applicant-information/tasks.md`
- ผล test: `PYTHONPATH=. pytest -q backend/tests/test_AC_REG_02.py backend/tests/test_AC_REG_01.py backend/tests/test_applicant_permissions.py` ผ่าน 5 tests; regression `PYTHONPATH=. pytest -q backend/tests` ผ่าน 16 tests
- สิ่งที่ทำ: เพิ่ม validation เบอร์โทรศัพท์ 10 หลักและชื่อห้ามมีตัวเลข, เพิ่ม `POST /applicants/{applicant_id}/validate`, ปฏิเสธ `PUT` ที่ข้อมูลไม่ถูกต้องด้วยข้อผิดพลาดระดับฟิลด์ และยืนยันว่า Applicant/Audit Log ไม่เปลี่ยน
- สิ่งที่เกือบต้องเดาแต่ถามแทน: ไม่พบประเด็นต้องถามเพิ่ม; ยึดกฎ validation และ response ที่ระบุใน spec/plan/tasks
- ขอบเขต: ทำเฉพาะ T-05 และเปลี่ยนสถานะ T-05 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:25 คำสั่ง: /implement T-06 specs/002-edit-applicant-information/task.md

- ไฟล์ที่สร้างหรือแก้: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx`, `frontend/src/api/client.js`, `specs/002-edit-applicant-information/tasks.md`
- ผล test: backend `test_AC_REG_02_reject_invalid_phone_and_no_audit` และ regression ก่อนหน้าได้ผล 16 tests ผ่าน; `cd frontend && npm run build` ผ่านหลังติดตั้ง dependencies ชั่วคราว; ไม่มี frontend test runner ใน package
- สิ่งที่ทำ: เพิ่มการเรียก validation ก่อน PUT, แสดงข้อผิดพลาดแยกฟิลด์ด้วย `aria-invalid`/ข้อความแนะนำ, คงค่าที่กรอกเมื่อ validation ไม่ผ่าน และไม่แสดง success state เมื่อบันทึกไม่สำเร็จ
- สิ่งที่เกือบต้องเดาแต่ถามแทน: ไม่พบประเด็นต้องถามเพิ่ม; ใช้ endpoint และ response ของ T-05 ตาม plan
- ขอบเขต: ทำเฉพาะ T-06 และเปลี่ยนสถานะ T-06 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:37 คำสั่ง: /implement T-07 specs/002-edit-applicant-information/task.md

- ไฟล์ที่สร้างหรือแก้: `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/tests/test_AC_REG_03.py`, `specs/002-edit-applicant-information/tasks.md`
- ผล test: `PYTHONPATH=. pytest -q backend/tests/test_AC_REG_03.py backend/tests/test_AC_REG_01.py backend/tests/test_AC_REG_02.py backend/tests/test_applicant_permissions.py` ผ่าน 6 tests; regression `PYTHONPATH=. pytest -q backend/tests` ผ่าน 17 tests
- สิ่งที่ทำ: เพิ่ม `POST /applicants/{applicant_id}/cancel-edit` ให้คืนสถานะยกเลิกและข้อมูลเดิม โดยไม่แก้ Applicant และไม่สร้าง Audit Log
- สิ่งที่เกือบต้องเดาแต่ถามแทน: ไม่พบประเด็นต้องถามเพิ่ม; ใช้ response `status` และข้อมูลเดิมตามเกณฑ์ `เสร็จเมื่อ` ของ T-07
- ขอบเขต: ทำเฉพาะ T-07 และเปลี่ยนสถานะ T-07 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:39 คำสั่ง: /implement T-08 specs/002-edit-applicant-information/task.md

- ไฟล์ที่สร้างหรือแก้: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/api/client.js`, `specs/002-edit-applicant-information/tasks.md`
- ผล test: `PYTHONPATH=. pytest -q backend/tests/test_AC_REG_03.py` ผ่าน 1 test; `cd frontend && npm run build` ผ่าน; frontend test runner ยังไม่มีใน package
- สิ่งที่ทำ: เชื่อมปุ่มยกเลิกกับ `POST /applicants/{applicant_id}/cancel-edit`, แสดงข้อมูลเดิมหลังยกเลิก, ซ่อนฟอร์มหลังยกเลิก และไม่เรียก update/Audit Log
- สิ่งที่เกือบต้องเดาแต่ถามแทน: ไม่พบประเด็นต้องถามเพิ่ม; ใช้ endpoint และ response ของ T-07 ตาม plan
- ขอบเขต: ทำเฉพาะ T-08 และเปลี่ยนสถานะ T-08 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:40 คำสั่ง: /implement T-09 specs/002-edit-applicant-information/task.md

- ไฟล์ที่สร้างหรือแก้: `backend/tests/test_AC_REG_01.py`, `backend/tests/test_AC_REG_02.py`, `backend/tests/test_AC_REG_03.py`, `specs/002-edit-applicant-information/tasks.md`
- ผล test: `PYTHONPATH=. pytest -q backend/tests` ผ่าน 20 tests; `cd frontend && npm run build` ผ่าน; frontend test runner ยังไม่มีใน package
- สิ่งที่ทำ: เพิ่ม regression สำหรับ transaction rollback เมื่อ Audit Log ล้มเหลว, ตรวจ validation/สิทธิ์, และวัดเวลา PUT พร้อม Audit Log เฉลี่ยไม่เกิน 1.5 วินาที; ตรวจ frontend ด้วย production build
- สิ่งที่เกือบต้องเดาแต่ถามแทน: ไม่พบประเด็นต้องถามเพิ่ม; ใช้เกณฑ์ NFR-PERF-01 และ DOM-TXN-01 จาก spec โดยตรง
- ข้อจำกัดการตรวจ: ยังไม่มี automated frontend test สำหรับ highlight ช่องผิด ต้องตรวจด้วยตาหรือเพิ่ม test runner ในงานแยก
- ขอบเขต: ทำเฉพาะ T-09 และเปลี่ยนสถานะ T-09 เป็น `เสร็จ รอทีมตรวจ`

---

## 2026-11-09 09:44 คำสั่ง: /testcases AC-REG-03 specs/002-edit-applicant-information/

- โหมด: ร่าง
- ไฟล์: `specs/002-edit-applicant-information/test-cases.md`
- TC ID ที่เสนอ: `TC-REG-03-1`, `TC-REG-03-2`, `TC-REG-03-3`
- ผลลัพธ์: เพิ่ม 3 แถวสำหรับทางปกติ ขอบ และทางผิด สถานะทุกแถวยังเป็น `ร่าง`; ยังไม่เขียนโค้ด test
- ประเด็นที่ spec ไม่ได้บอก: ผลลัพธ์เมื่อกดยกเลิกโดยยังไม่ได้เปลี่ยนข้อมูลใน `TC-REG-03-3`

---

## 2026-11-09 09:29 คำสั่ง: /testcases AC-REG-02 specs/002-edit-applicant-information/

- โหมด: ร่าง
- ไฟล์: `specs/002-edit-applicant-information/test-cases.md`
- TC ID ที่เสนอ: `TC-REG-02-1`, `TC-REG-02-2`, `TC-REG-02-3`
- ผลลัพธ์: เพิ่ม 3 แถวสำหรับทางปกติ ขอบ และทางผิด สถานะทุกแถวยังเป็น `ร่าง`; ยังไม่เขียนโค้ด test
- ประเด็นที่ spec ไม่ได้บอก: ผลการบันทึกและการสร้าง Audit Log เมื่อเบอร์โทรศัพท์ครบ 10 หลักและผ่าน validation ในแถวขอบ `TC-REG-02-2`

---

## 2026-11-09 09:48 คำสั่ง: /verify specs/002-edit-applicant-information/

- ไฟล์ที่อ่านตรวจ: `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, `rtm.md`, `AGENTS.md`, โค้ดทั้งหมดใน `backend/app/` และ `frontend/src/`, test ทั้งหมดใน `backend/tests/` และ `frontend/src/__tests__/`
- ผล test: backend ผ่าน 20 tests, ไม่ผ่าน 0 tests; `cd frontend && npm test` รันไม่ได้เพราะ `package.json` ไม่มี script `test`
- จำนวนแถวตามรอยไปข้างหน้า: `ครบ` 4, `ยังไม่ถึง` 0, `รอ Q-xx` 0, `ช่องโหว่` 8
- ข้อค้นพบเดิมที่แก้แล้ว: F-03, F-04
- ข้อค้นพบเดิมที่ยังพบ: F-01, F-02, F-05, F-06, F-07
- ข้อค้นพบใหม่: F-08, F-09, F-10
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 10:54 คำสั่ง: /verify specs/002-edit-applicant-information

- ไฟล์ที่อ่านตรวจ: `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, `rtm.md`, `AGENTS.md`, โค้ดทั้งหมดใน `backend/app/` และ `frontend/src/`, test ทั้งหมดใน `backend/tests/` และ `frontend/src/__tests__/`
- ผล test: backend ผ่าน 20 tests, ไม่ผ่าน 0 tests; `cd frontend && npm test` รันไม่ได้เพราะ `package.json` ไม่มี script `test`
- จำนวนแถวตามรอยไปข้างหน้า: `ครบ` 4, `ยังไม่ถึง` 0, `รอ Q-xx` 0, `ช่องโหว่` 8
- ข้อค้นพบเดิมที่แก้แล้ว: F-03, F-04
- ข้อค้นพบเดิมที่ยังพบ: F-01, F-02, F-05, F-06, F-07, F-08, F-09, F-10
- ข้อค้นพบใหม่: ไม่มี
- การปรับธีม frontend เป็นการเปลี่ยน presentation ใน `frontend/src/styles/applicant-edit.css`; ไม่พบการเพิ่ม requirement หรือการเปลี่ยน behavior ของฟีเจอร์
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 13:11 คำสั่ง: /testcases AC-REG-01 specs/002-edit-applicant-information

- โหมด: เขียน test จากแถวสถานะ `ใช้ได้`
- TC ID ที่เขียน: `TC-REG-01-1`, `TC-REG-01-2`, `TC-REG-01-3`
- ไฟล์ test: `backend/tests/test_AC_REG_01.py`
- ผล test: เพิ่ม test 3 ตัวตามจำนวนแถวที่เลือก; `cd backend && PYTHONPATH=.. pytest -v` ผ่าน 23 tests, ไม่ผ่าน 0 tests
- จำนวน test ในไฟล์ AC-REG-01: จาก 3 ตัวเดิมเป็น 6 ตัวใหม่
- ประเด็นที่ไม่ใส่ assert: `TC-REG-01-2` ระบุว่า spec ไม่ได้บอกว่าต้องสร้าง Audit Log เมื่อไม่มีฟิลด์เปลี่ยนแปลง จึงบันทึกไว้เป็นคอมเมนต์ตามกติกา

---

## 2026-11-09 13:14 คำสั่ง: /testcases AC-REG-02 specs/002-edit-applicant-information

- โหมด: เขียน test จากแถวสถานะ `ใช้ได้`
- TC ID ที่เขียน: `TC-REG-02-1`, `TC-REG-02-2`, `TC-REG-02-3`
- ไฟล์ test: `backend/tests/test_AC_REG_02.py`
- ผล test: เพิ่ม test 3 ตัวตามจำนวนแถวที่เลือก; `cd backend && PYTHONPATH=.. pytest -v` ผ่าน 26 tests, ไม่ผ่าน 0 tests
- จำนวน test ในไฟล์ AC-REG-02: จาก 2 ตัวเดิมเป็น 5 ตัวใหม่
- ข้อจำกัด: แถวระบุ `pytest + vitest` แต่ frontend ไม่มี script `test` และไม่มี test runner; test ที่เพิ่มตรวจเฉพาะ validation, การไม่บันทึก และการไม่สร้าง Audit Log ฝั่ง backend
- ประเด็นที่ไม่ใส่ assert: `TC-REG-02-2` ระบุว่าสเปกไม่ได้บอกผลการบันทึกหรือ Audit Log เมื่อเบอร์ 10 หลักผ่าน validation จึงตรวจเฉพาะผล validation

---

## 2026-11-09 13:34 คำสั่ง: /verify specs/002-edit-applicant-information/

- อ่าน `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, `rtm.md`, `AGENTS.md`, implementation ทั้งหมดใน `backend/app/` และ `frontend/src/` รวมถึง tests ใน `backend/tests/` และ `frontend/src/__tests__/`
- ผล test: backend ผ่าน 26 tests, ไม่ผ่าน 0 tests; `cd frontend && npm test` รันไม่ได้เพราะ `frontend/package.json` ไม่มี script `test`
- จำนวนแถวตามรอยไปข้างหน้า: ครบ 4, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 8
- ข้อค้นพบเดิมที่ยังพบ: F-01, F-02, F-05, F-06, F-07, F-08, F-09, F-10
- ข้อค้นพบใหม่: ไม่มี
- การปรับปรุงจากรอบก่อน: F-05 ระบุว่าการตรวจสิทธิ์ PUT มีแล้วแต่ cancel ยังไม่มี; F-08 เหลือเฉพาะ TC-REG-03-1 และ TC-REG-03-2 เพราะ AC-REG-01 และ AC-REG-02 มี test ตามแถวแล้ว
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 15:18 คำสั่ง: /testcases AC-REG-01 specs/002-edit-applicant-information/

- โหมด: ตรวจโหมดเขียน test จากแถวสถานะ `ใช้ได้`
- TC ID ที่ตรวจ: `TC-REG-01-1`, `TC-REG-01-2`, `TC-REG-01-3`
- ผลการตรวจ: ทั้ง 3 แถวมี test ชื่อตรงตามตารางอยู่แล้วใน `backend/tests/test_AC_REG_01.py` จึงไม่เพิ่ม test ซ้ำและไม่แก้ test เดิม
- ผล test: `cd backend && PYTHONPATH=.. pytest -v` ผ่าน 26 tests, ไม่ผ่าน 0 tests

---

## 2026-11-09 15:21 คำสั่ง: /testcases AC-REG-02 specs/002-edit-applicant-information/

- โหมด: ตรวจโหมดเขียน test จากแถวสถานะ `ใช้ได้`
- TC ID ที่ตรวจ: `TC-REG-02-1`, `TC-REG-02-2`, `TC-REG-02-3`
- ผลการตรวจ: ทั้ง 3 แถวมี test ชื่อตรงตามตารางอยู่แล้วใน `backend/tests/test_AC_REG_02.py` จึงไม่เพิ่ม test ซ้ำและไม่แก้ test เดิม
- ผล test: `cd backend && PYTHONPATH=.. pytest -v` ผ่าน 26 tests, ไม่ผ่าน 0 tests
- ข้อจำกัดเดิม: แถวที่ระบุ `pytest + vitest` ยังไม่มี frontend test เพราะ `frontend/package.json` ไม่มี script `test` และไม่มี test runner

---

## 2026-11-09 15:27 คำสั่ง: ติดตั้ง Vitest เป็น Test Runner และเพิ่ม test script ใน package.json

- เพิ่ม `vitest` ใน `frontend/package.json` และ `frontend/package-lock.json` เป็น `devDependencies`
- ยืนยัน scripts: `test: vitest` และ `test:run: vitest run`
- ผล `cd frontend && npm run test:run`: ผ่าน 3 tests จาก 3 test files
- ผล `cd frontend && npm run build`: ผ่าน

---

## 2026-11-09 16:02 คำสั่ง: /verify specs/002-edit-applicant-information/

- อ่าน `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, `rtm.md`, `AGENTS.md`, implementation ทั้งหมดใน `backend/app/` และ `frontend/src/` รวมถึง tests ใน `backend/tests/` และ `frontend/src/__tests__/`
- ผล test: backend ผ่าน 26 tests, ไม่ผ่าน 0 tests; frontend `npm test -- --run` ผ่าน 3 tests จาก 3 test files, ไม่ผ่าน 0 tests
- จำนวนแถวตามรอยไปข้างหน้า: ครบ 4, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 8
- ข้อค้นพบเดิมที่ยังพบ: F-01, F-02, F-05, F-06, F-08, F-09, F-10
- ข้อค้นพบเดิมที่แก้แล้ว: F-07 เพราะเพิ่ม Vitest และ `test` script แล้ว; frontend tests ที่มีอยู่ยังเป็นของ scheduling ไม่ใช่ Applicant Edit
- ข้อค้นพบใหม่: ไม่มี
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks

---

## 2026-11-09 16:06 คำสั่ง: เพิ่ม Test ของ Applicant Edit tests และแก้ไขช่องโหว่ใน rtm.md

- เพิ่ม `frontend/src/__tests__/ApplicantEdit.test.jsx` ครอบคลุม save, validation/error highlight, คงค่า และ cancel สำหรับ `TC-REG-01-1`, `TC-REG-02-1`, `TC-REG-03-1`, `TC-REG-03-2`
- เพิ่ม backend tests `TC-REG-03-1` และ `TC-REG-03-2` ใน `backend/tests/test_AC_REG_03.py`
- เพิ่ม test สิทธิ์ role ต้องห้ามสำหรับ `cancel-edit` ใน `backend/tests/test_applicant_permissions.py`
- ผล test: backend ผ่าน 29 tests, ไม่ผ่าน 0 tests; frontend ผ่าน 7 tests จาก 4 test files, ไม่ผ่าน 0 tests
- ผล build: `cd frontend && npm run build` ผ่าน
- RTM: ย้าย F-05, F-06, F-08 และ F-09 ไปหัวข้อ `แก้แล้ว`; คง F-01, F-02 และ F-10 ไว้ให้ทีมตัดสิน

---

## 2026-11-09 18:53 คำสั่ง: /verify spec/002-edit-applicant-information

- อ่าน `spec.md`, `plan.md`, `tasks.md`, `test-cases.md`, `rtm.md`, `AGENTS.md`, โค้ดทั้งหมดใน `backend/app/` และ `frontend/src/` รวมถึง test ทั้งหมด
- ผล `cd backend && pytest -v`: เก็บ test ไม่ได้ 10 errors เพราะ `ModuleNotFoundError: No module named 'backend'` จาก import path
- ผล `cd backend && PYTHONPATH=.. pytest -v`: backend ผ่าน 31 tests, ไม่ผ่าน 0 tests
- ผล `cd frontend && npm test`: frontend ผ่าน 7 tests จาก 4 test files, ไม่ผ่าน 0 tests
- จำนวนแถวตามรอยไปข้างหน้า: ครบ 9, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 3
- ข้อค้นพบใหม่: F-11 AC ไม่มี test สำหรับ TC-REG-03-3; F-12 โค้ดไม่มี FR เรื่องค้นหาผู้สมัคร; F-13 ไม่บังคับ ASM-04 เมื่อการลงทะเบียนเสร็จสิ้น; F-14 ไม่มี retention ของ Audit Log; F-15 test อ่อนสำหรับการแสดงข้อมูลเดิมครบทุกฟิลด์
- ขอบเขต: แก้เฉพาะ `specs/002-edit-applicant-information/rtm.md` และเพิ่มบันทึกนี้; ไม่แก้โค้ด, test, spec, plan หรือ tasks
