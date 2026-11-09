# RTM: แก้ไขข้อมูลผู้สมัคร

อ้างอิง: [spec.md](./spec.md) `Draft v2` | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
สร้างด้วย `/verify` เมื่อ 2569-11-09 13:34 | test: 26 ผ่าน 0 ไม่ผ่าน; frontend `npm test` รันไม่ได้เพราะไม่มี script `test`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-REG-01 | ไม่มี AC | T-01, T-02, T-03, T-04, T-08, T-09 | `backend/app/api/applicants.py:open_edit_form`, `ApplicantService.get_for_edit`, `frontend/src/pages/ApplicantEditPage.jsx` | `test_AC_REG_01_save_edit_and_create_audit_log` อ่านข้อมูลเดิมบางส่วน; ไม่มี AC/test เฉพาะการแสดงข้อมูลเดิม | ช่องโหว่ |
| FR-REG-02 | AC-REG-02 | T-05, T-06, T-09 | `validate_applicant_payload`, `POST /validate`, `ApplicantEditPage.save` | `test_AC_REG_02_reject_invalid_phone_and_no_audit`, `test_TC_REG_02_1_reject_short_phone_and_keep_input`, `test_TC_REG_02_2_accept_ten_digit_phone_boundary`, `test_TC_REG_02_3_reject_phone_with_letters_and_keep_input` ผ่าน; ไม่มี frontend test ตรวจการแสดงผล | ช่องโหว่ |
| FR-REG-03 | AC-REG-02 | T-05, T-06, T-09 | `update_applicant`, `ApplicantEditPage.save`, `ApplicantEditForm` | backend ตรวจ 422/ไม่บันทึก/ไม่สร้าง log ผ่าน; ไม่มี vitest ตรวจคงค่าและข้อความบนหน้าจอ | ช่องโหว่ |
| FR-REG-04 | AC-REG-01 | T-03, T-04, T-09 | `PUT /applicants/{applicant_id}`, `ApplicantService.update`, `updateApplicant` | `test_AC_REG_01_save_edit_and_create_audit_log` ผ่าน; มี performance regression ผ่าน | ครบ |
| FR-REG-05 | AC-REG-01 | T-03, T-04, T-09 | `ApplicantService.update`, `applicant_audit_logs` | `test_AC_REG_01_save_edit_and_create_audit_log` ผ่าน และตรวจผู้แก้ไข วันเวลา ฟิลด์ ค่าเดิม ค่าใหม่ | ครบ |
| FR-REG-06 | AC-REG-03 | T-07, T-08, T-09 | `POST /cancel-edit`, `ApplicantService.cancel_edit`, `ApplicantEditPage.cancel` | `test_AC_REG_03_cancel_restores_original_state` ผ่าน; ไม่มี frontend test ตรวจปิดฟอร์ม | ช่องโหว่ |
| NFR-PERF-01 | ไม่มี AC | T-03, T-09 | `ApplicantService.update` | `test_AC_REG_01_save_with_audit_log_average_response_under_1_5_seconds` ผ่าน | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC | T-02, T-09 | `get_current_editor`, dependency ทุก applicant endpoint | `test_TC_REG_01_3_reject_unauthorized_editor` ตรวจ GET/PUT และ permission tests ตรวจ GET; ยังไม่มี test role ต้องห้ามสำหรับ cancel | ช่องโหว่ |
| NFR-USE-01 | ไม่มี AC | T-05, T-06, T-09 | `ApplicantEditForm` ใช้ `aria-invalid`, `aria-describedby`, field error | ไม่มี frontend test และ `npm test` รันไม่ได้ | ช่องโหว่ |
| DOM-AUD-01 | AC-REG-01, AC-REG-02, AC-REG-03 | T-01, T-03, T-07, T-09 | schema `applicant_audit_logs`, `ApplicantService.update/cancel_edit` | AC-REG-01 ตรวจ log; AC-REG-02/03 ตรวจไม่มี log; ผ่าน | ครบ |
| DOM-TXN-01 | AC-REG-01 | T-01, T-03, T-09 | `transaction`, `ApplicantService.update` | `test_transaction_rolls_back_applicant_when_audit_insert_fails` ผ่าน | ครบ |
| SEC-RBAC-01 | AC-REG-01 | T-02, T-04, T-09 | `get_current_editor`, applicant router | `test_authorized_applicant_roles_can_access_edit_route`, `test_TC_REG_01_3_reject_unauthorized_editor`, unauthorized/missing identity ผ่าน; cancel ยังไม่มี test role ต้องห้าม | ช่องโหว่ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/applicants.py:GET /applicants/{applicant_id}/edit` | FR-REG-01, SEC-RBAC-01 | ตรงเมื่อมีข้อมูล | กรณีไม่พบผู้สมัครคืน fallback `edit-ready` โดยไม่มีข้อมูลเดิม; ดู F-02 |
| `backend/app/api/applicants.py:PUT /applicants/{applicant_id}` | FR-REG-04, FR-REG-05, DOM-TXN-01, SEC-RBAC-01 | ตรง | validation/transaction/role guard ตรง และมี test role ต้องห้ามสำหรับ PUT |
| `backend/app/api/applicants.py:POST /applicants/{applicant_id}/validate` | FR-REG-02, FR-REG-03, NFR-USE-01 | ตรงบางส่วน | คืน field errors แต่การ highlight เป็นหน้าที่ frontend ซึ่งยังไม่มี automated test |
| `backend/app/api/applicants.py:POST /applicants/{applicant_id}/cancel-edit` | FR-REG-06, DOM-AUD-01, SEC-RBAC-01 | ตรงบางส่วน | คืนข้อมูลเดิมและไม่เขียน Applicant/Audit Log; ยังไม่มี test role ต้องห้ามสำหรับ endpoint นี้ |
| `backend/app/api/applicants.py:ApplicantUpdatePayload` | FR-REG-02, FR-REG-04 | ตรงบางส่วน | allowlist ฟิลด์ตรง plan; validation รูปแบบมีเฉพาะชื่อและเบอร์โทรศัพท์ตาม spec ตัวอย่าง |
| `backend/app/services/applicant_service.py:ApplicantService.update` | FR-REG-04, FR-REG-05, DOM-AUD-01, DOM-TXN-01, ASM-02, ASM-06 | ตรง | update และ Audit Log อยู่ transaction เดียวกัน; ใช้ Asia/Bangkok และบันทึกเฉพาะฟิลด์ที่เปลี่ยน |
| `backend/app/services/applicant_service.py:ApplicantService.cancel_edit` | FR-REG-06 | ตรง | อ่านข้อมูลเดิมโดยไม่สร้าง log |
| `backend/app/validators/applicant_validator.py:validate_applicant_payload` | FR-REG-02, FR-REG-03 | ตรง | ตรวจเบอร์ 10 หลัก/ตัวเลขและชื่อห้ามมีตัวเลข |
| `backend/app/middleware/authz.py:get_current_editor` | SEC-RBAC-01, NFR-SEC-01 | ตรง | fail-closed และอนุญาตเฉพาะ `committee`/`admin` |
| `frontend/src/api/client.js:getApplicantForEdit/updateApplicant/validateApplicant/cancelApplicantEdit` | FR-REG-01, FR-REG-02, FR-REG-04, FR-REG-06 | ตรง | ครบ route client ตามที่มี implementation |
| `frontend/src/pages/ApplicantEditPage.jsx:save/cancel` | FR-REG-03, FR-REG-04, FR-REG-06 | ตรงบางส่วน | UI behavior มีอยู่ แต่ไม่มี automated frontend test |
| `frontend/src/components/ApplicantEditForm.jsx:submit` | FR-REG-03, FR-REG-04, NFR-USE-01 | ตรงบางส่วน | มี field error semantics แต่ test runner/test ของฟีเจอร์ยังไม่มี |
| `frontend/src/styles/applicant-edit.css` | FR-REG-03, NFR-USE-01 | ตรงบางส่วน | จัดธีมและ visual state ของฟอร์ม; ไม่มี automated frontend test ยืนยันการแสดงผล |
| `frontend/src/main.jsx:renderPage` | FR-REG-01, SEC-RBAC-01 | ตรงบางส่วน | route ถูกเลือกใน frontend; authorization อยู่ backend |
| `plan.md:GET /applicants/{applicant_id}/audit-log` | DOM-AUD-01 | ยังไม่พบ implementation | เป็น API ใน plan แต่ไม่มี endpoint หรือ task ที่ทำจริง; spec ระบุให้เก็บ Audit Log แต่ไม่ได้ระบุ API ดูประวัติ |

## 3. ข้อค้นพบ

ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | FR ไม่มี AC | `spec.md:FR-REG-01` | FR-REG-01 | FR-REG-01 ไม่มี AC ที่ตรวจการค้นหา/แสดงข้อมูลเดิมโดยตรง | |
| F-02 | โค้ดไม่มี FR / test อ่อน | `backend/app/api/applicants.py:open_edit_form` | FR-REG-01, ASM-01 | กรณีไม่พบผู้สมัครคืน success-shaped fallback `edit-ready` โดยไม่มีข้อมูลเดิม; behavior นี้ไม่ได้ยืนยันการแสดงข้อมูลเดิม | |
| F-05 | test อ่อน | `backend/tests/test_applicant_permissions.py`, `backend/tests/test_AC_REG_01.py` | SEC-RBAC-01, NFR-SEC-01 | มี test role ต้องห้ามสำหรับ GET และ PUT แล้ว แต่ยังไม่มี test ว่า role ต้องห้ามถูกปฏิเสธที่ cancel endpoint | |
| F-06 | test อ่อน / frontend test ไม่มี | `frontend/src/pages/ApplicantEditPage.jsx`, `frontend/src/components/ApplicantEditForm.jsx` | FR-REG-02, FR-REG-03, FR-REG-04, FR-REG-05, FR-REG-06, NFR-USE-01 | มี UI behavior ในโค้ด แต่ไม่มี vitest ตรวจการแจ้งเตือน การคงค่า การแสดง success และการปิดฟอร์ม | |
| F-07 | test ไม่พร้อม | `frontend/package.json`, `frontend/src/__tests__/` | AC-REG-01, AC-REG-02, AC-REG-03 | `npm test` รันไม่ได้เพราะไม่มี script `test`; ไม่มี test หน้าจอของ Applicant Edit | |
| F-08 | AC ไม่มี test ตามตาราง | `specs/002-edit-applicant-information/test-cases.md` | AC-REG-03 | แถว `TC-REG-03-1`, `TC-REG-03-2` เป็น `ใช้ได้` แต่ยังไม่มี test ชื่อตามตารางในโค้ด; AC-REG-01 และ AC-REG-02 มี test ตามแถวเพิ่มแล้ว ส่วน `TC-REG-03-3` ระบุให้ตรวจด้วยคน | |
| F-09 | test อ่อน | `backend/tests/test_AC_REG_02.py` | AC-REG-02, NFR-USE-01 | test backend ตรวจ field error แต่ไม่สามารถตรวจ highlight, ข้อความบนหน้าจอ หรือการคงค่าใน React state ได้ | |
| F-10 | โค้ดไม่มี FR ตาม plan | `backend/app/api/applicants.py` | DOM-AUD-01 | plan ระบุ `GET /applicants/{applicant_id}/audit-log` แต่ไม่มี implementation; spec ระบุการเก็บ Audit Log แต่ไม่ได้ระบุ API ดูประวัติ จึงต้องให้ทีมตัดสินว่าจะคง API ใน plan หรือเอาออก | |

## 4. แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-03 | T-07/T-08 เพิ่ม cancel endpoint/client และซ่อนฟอร์มหลังยกเลิกพร้อมแสดงข้อมูลเดิม | อ่าน `ApplicantEditPage.cancel`, `cancelApplicantEdit` และ backend test AC-REG-03; backend test ผ่าน |
| F-04 | T-09 เพิ่ม test ให้ Audit insert ล้มเหลวแล้ว Applicant rollback และไม่มี Audit Log | `test_transaction_rolls_back_applicant_when_audit_insert_fails` ผ่าน |
