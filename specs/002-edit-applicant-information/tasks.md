# Tasks: แก้ไขข้อมูลผู้สมัคร (Edit Applicant Information)

- Feature: แก้ไขข้อมูลผู้สมัคร
- Spec ID: SPEC-REG-002
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-11-09

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 4 เฟส (เฟส 0 และเฟสตาม AC-REG-01 ถึง AC-REG-03)
- งานย่อย: 9 task, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 แก้ไขและบันทึกข้อมูลพร้อม Audit Log สำเร็จ

## เฟส 0: ฐานรากข้อมูลผู้สมัครและสิทธิ์ (ไม่มี AC)

### T-01 สร้างโมเดล Applicant และ AuditLog
- รองรับ: FR-REG-01, FR-REG-04, FR-REG-05, DOM-AUD-01, DOM-TXN-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 และ T-04
- ไฟล์ที่แตะ: `backend/db/schema.sql`, `backend/app/models/applicant.py`, `backend/app/models/audit_log.py`, `backend/app/db/transaction.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ตารางและโมเดลรองรับข้อมูลผู้สมัคร ฟิลด์ที่แก้ไขได้ และ Audit Log ที่เก็บผู้แก้ไข วันเวลา ค่าเดิม ค่าใหม่ และฟิลด์ที่เปลี่ยนแปลงได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้างโครง API และตรวจบทบาทผู้ใช้
- รองรับ: FR-REG-01, SEC-RBAC-01, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-04 และ T-08
- ไฟล์ที่แตะ: `backend/app/main.py`, `backend/app/api/applicants.py`, `backend/app/models/user_account.py`, `backend/app/middleware/authz.py`, `backend/tests/test_applicant_permissions.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: โครง router และตัวตรวจสิทธิ์ทำให้บทบาท `committee` หรือ `admin` เข้าถึง endpoint ของฟีเจอร์ได้ และผู้ไม่มีสิทธิ์ถูกปฏิเสธ
- สถานะ: เสร็จ รอทีมตรวจ

## เฟส 1: แก้ไขและบันทึกข้อมูลพร้อม Audit Log สำเร็จ (AC-REG-01)

### T-03 สร้าง API เปิดข้อมูลเดิมและบันทึกแบบ transaction
- รองรับ: FR-REG-01, FR-REG-04, FR-REG-05, DOM-AUD-01, DOM-TXN-01, NFR-PERF-01
- ตรวจด้วย: AC-REG-01
- ไฟล์ที่แตะ: `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/app/validators/applicant_validator.py`, `backend/app/db/transaction.py`, `backend/tests/test_AC_REG_01.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /applicants/{applicant_id}/edit` คืนข้อมูลเดิม, `PUT /applicants/{applicant_id}` อัปเดตข้อมูลกับ Audit Log ใน transaction เดียวกัน และ `GET /applicants/{applicant_id}/audit-log` คืนประวัติการเปลี่ยนแปลง โดยบันทึกเฉพาะฟิลด์ที่เปลี่ยนและมีผลตอบสนองเฉลี่ยไม่เกิน 1.5 วินาที
- สถานะ: เสร็จ รอทีมตรวจ

### T-04 สร้างหน้าจอฟอร์มแก้ไขและการยืนยัน
- รองรับ: FR-REG-01, FR-REG-04, FR-REG-05, SEC-RBAC-01
- ตรวจด้วย: AC-REG-01
- ไฟล์ที่แตะ: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx`, `frontend/src/api/client.js`, `frontend/src/main.jsx`
- แบบหน้าจอ: ไม่มี mockup ตาม spec
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: ผู้มีสิทธิ์เปิด `/applicants/:id/edit` เห็นข้อมูลเดิม แก้เบอร์โทรศัพท์ กดยืนยันผ่าน `frontend/src/api/client.js` และเห็นผลสำเร็จจากข้อมูลที่บันทึกแล้ว
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_REG_01_save_edit_and_create_audit_log`, `test_applicant_permissions` และ test ของเฟส 0 ต้องยังผ่าน
- เปิดระบบ: หลังบ้าน `uvicorn backend.app.main:app --reload`; หน้าจอ `npm run dev` ใน `frontend/`
- คนลองเองตาม AC-REG-01:
  Given คณะกรรมการเปิดหน้าข้อมูลผู้สมัครที่มีเบอร์โทรศัพท์เดิม
  When แก้ไขเบอร์โทรศัพท์ติดต่อแล้วกด "ยืนยัน"
  Then ระบบบันทึกเบอร์ใหม่และสร้าง Audit Log ที่ระบุผู้แก้ไข วันเวลา ฟิลด์ เบอร์เดิม และเบอร์ใหม่
- ยังขาด: ไม่มี

## เฟส 2: ปฏิเสธข้อมูลไม่ถูกต้องและคงค่าที่กรอก (AC-REG-02)

### T-05 สร้าง validation และการตอบกลับเมื่อข้อมูลไม่ถูกต้อง
- รองรับ: FR-REG-02, FR-REG-03, NFR-USE-01
- ตรวจด้วย: AC-REG-02
- ไฟล์ที่แตะ: `backend/app/validators/applicant_validator.py`, `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/tests/test_AC_REG_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `POST /applicants/{applicant_id}/validate` ปฏิเสธเบอร์โทรศัพท์ที่ไม่ครบ 10 หลักหรือมีตัวอักษร คืนข้อผิดพลาดที่ระบุฟิลด์ และไม่เรียกการบันทึกหรือสร้าง Audit Log
- สถานะ: เสร็จ รอทีมตรวจ

### T-06 แสดงข้อผิดพลาดและคงค่าฟอร์มที่กรอก
- รองรับ: FR-REG-02, FR-REG-03, NFR-USE-01
- ตรวจด้วย: AC-REG-02
- ไฟล์ที่แตะ: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx`, `frontend/src/api/client.js`, `backend/tests/test_AC_REG_02.py`
- แบบหน้าจอ: ไม่มี mockup ตาม spec
- ต้องทำหลัง: T-04, T-05
- เสร็จเมื่อ: `test_AC_REG_02_reject_invalid_phone_and_no_audit` ผ่าน และหน้าจอ highlight ช่องที่ผิด แสดงข้อความแนะนำ คงค่าที่กรอก และไม่แสดงผลสำเร็จปลอม
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_REG_01_save_edit_and_create_audit_log`, `test_AC_REG_02_reject_invalid_phone_and_no_audit` และ test ของเฟส 0 ต้องยังผ่าน
- เปิดระบบ: หลังบ้าน `uvicorn backend.app.main:app --reload`; หน้าจอ `npm run dev` ใน `frontend/`
- คนลองเองตาม AC-REG-02:
  Given คณะกรรมการอยู่ในหน้าแก้ไขข้อมูลผู้สมัคร
  When กรอกเบอร์โทรศัพท์ไม่ครบ 10 หลักแล้วกด "ยืนยัน"
  Then ระบบ highlight ช่องเบอร์โทรศัพท์ แจ้งให้แก้ไข คงค่าที่กรอก ไม่บันทึกข้อมูล และไม่สร้าง Audit Log
- ยังขาด: ไม่มี

## เฟส 3: ยกเลิกการแก้ไขและคืนข้อมูลเดิม (AC-REG-03)

### T-07 สร้าง API ยกเลิกการแก้ไข
- รองรับ: FR-REG-06, DOM-AUD-01
- ตรวจด้วย: AC-REG-03
- ไฟล์ที่แตะ: `backend/app/api/applicants.py`, `backend/app/services/applicant_service.py`, `backend/tests/test_AC_REG_03.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: `POST /applicants/{applicant_id}/cancel-edit` คืนสถานะยกเลิกและข้อมูลเดิม โดยไม่อัปเดต Applicant และไม่สร้าง Audit Log
- สถานะ: เสร็จ รอทีมตรวจ

### T-08 เชื่อมปุ่มยกเลิกและปิดฟอร์ม
- รองรับ: FR-REG-06, FR-REG-01
- ตรวจด้วย: AC-REG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx`, `frontend/src/api/client.js`, `backend/tests/test_AC_REG_03.py`
- แบบหน้าจอ: ไม่มี mockup ตาม spec
- ต้องทำหลัง: T-04, T-07
- เสร็จเมื่อ: `test_AC_REG_03_cancel_restores_original_state` ผ่าน และเมื่อกดยกเลิกหน้าจอแสดงข้อมูลเดิม ปิดฟอร์ม และไม่สร้าง Audit Log ใหม่
- สถานะ: เสร็จ รอทีมตรวจ

### T-09 ทดสอบ end-to-end และเกณฑ์คุณภาพของฟีเจอร์
- รองรับ: FR-REG-01, FR-REG-02, FR-REG-03, FR-REG-04, FR-REG-05, FR-REG-06, NFR-PERF-01, NFR-SEC-01, NFR-USE-01, DOM-AUD-01, DOM-TXN-01, SEC-RBAC-01
- ตรวจด้วย: AC-REG-01, AC-REG-02, AC-REG-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_REG_01.py`, `backend/tests/test_AC_REG_02.py`, `backend/tests/test_AC_REG_03.py`, `frontend/src/api/client.js`
- แบบหน้าจอ: ไม่มี mockup ตาม spec
- ต้องทำหลัง: T-06, T-08
- เสร็จเมื่อ: test ของ AC ทั้งสามข้อผ่านร่วมกัน ตรวจว่า transaction ไม่ทิ้งข้อมูลบางส่วนเมื่อผิดพลาด ผู้ไม่มีสิทธิ์ถูกปฏิเสธ ช่องผิดถูก highlight และเวลา PUT พร้อม Audit Log เฉลี่ยไม่เกิน 1.5 วินาที
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_AC_REG_01_save_edit_and_create_audit_log`, `test_AC_REG_02_reject_invalid_phone_and_no_audit`, `test_AC_REG_03_cancel_restores_original_state` และ test ของเฟส 0 ต้องยังผ่าน
- เปิดระบบ: หลังบ้าน `uvicorn backend.app.main:app --reload`; หน้าจอ `npm run dev` ใน `frontend/`
- คนลองเองตาม AC-REG-03:
  Given คณะกรรมการเปลี่ยนข้อมูลในฟอร์มแก้ไขแต่ยังไม่ยืนยัน
  When กดปุ่ม "ยกเลิก"
  Then ระบบยกเลิกการเปลี่ยนแปลง แสดงข้อมูลเดิม ปิดฟอร์ม และไม่มี Audit Log ใหม่
- ยังขาด: ไม่มี

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-REG-01 | T-03, T-04, T-09 |
| AC-REG-02 | T-05, T-06, T-09 |
| AC-REG-03 | T-07, T-08, T-09 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| DOM-AUD-01 | T-01, T-03, T-07, T-09 |
| DOM-TXN-01 | T-01, T-03, T-09 |
| SEC-RBAC-01 | T-02, T-04, T-09 |

## ตารางตรวจความครบ: Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-REG-01 | ไม่มี AC ควรเสนอทีมเพิ่ม | เฟส 0, เฟส 1, เฟส 3 |
| FR-REG-02 | AC-REG-02 | เฟส 2 |
| FR-REG-03 | AC-REG-02 | เฟส 2 |
| FR-REG-04 | AC-REG-01 | เฟส 1 |
| FR-REG-05 | AC-REG-01 | เฟส 1 |
| FR-REG-06 | AC-REG-03 | เฟส 3 |

## สิ่งที่ยังไม่ทำ

- Open Questions: ไม่มีใน spec ปัจจุบัน
- Task ที่รอ Q-xx: ไม่มี
- Assumptions ASM-01 ถึง ASM-07 เป็นเงื่อนไขจาก spec ที่ต้องใช้ตรวจสอบระหว่างพัฒนา ไม่ใช่ Open Questions
