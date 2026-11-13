# RTM: แก้ไขข้อมูลผู้สมัคร

อ้างอิง: [spec.md](./spec.md) `Draft v2` | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
สร้างด้วย `/verify` เมื่อ 2569-11-09 19:16 | test: `pytest -v` จาก `backend/` เก็บ test ไม่ได้ 10 errors จาก import path; `PYTHONPATH=.. pytest -q` 34 ผ่าน 0 ไม่ผ่าน; frontend 7 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-REG-01 | AC-REG-01 | T-01, T-02, T-03, T-04, T-08, T-09 | `backend/app/api/applicants.py:search_applicants/open_edit_form`, `ApplicantService.search/get_for_edit`, `ApplicantSearchPage`, `ApplicantEditPage` | backend ตรวจค้นหาด้วย ID/ชื่อและ response ข้อมูลเดิม; frontend Applicant Edit test ตรวจข้อมูลเดิมครบทุกฟิลด์ | ครบ |
| FR-REG-02 | AC-REG-02 | T-05, T-06, T-09 | `validate_applicant_payload`, `POST /validate`, `ApplicantEditPage.save` | backend tests ของ AC-REG-02 และ `test_TC_REG_02_1_reject_short_phone_and_keep_input` ผ่าน; frontend ตรวจ validation flow | ครบ |
| FR-REG-03 | AC-REG-02 | T-05, T-06, T-09 | `update_applicant`, `ApplicantEditPage.save`, `ApplicantEditForm` | backend ตรวจ 422/ไม่บันทึก/ไม่สร้าง log และ frontend ตรวจข้อความ, highlight, คงค่า, ไม่เรียก update ผ่าน | ครบ |
| FR-REG-04 | AC-REG-01 | T-03, T-04, T-09 | `PUT /applicants/{applicant_id}`, `ApplicantService.update`, `updateApplicant` | `test_AC_REG_01_save_edit_and_create_audit_log` และ completed-registration guard ผ่าน; มี performance regression ผ่าน | ครบ |
| FR-REG-05 | AC-REG-01 | T-03, T-04, T-09 | `ApplicantService.update`, `applicant_audit_logs` | `test_AC_REG_01_save_edit_and_create_audit_log` ผ่าน และตรวจผู้แก้ไข วันเวลา ฟิลด์ ค่าเดิม ค่าใหม่ | ครบ |
| FR-REG-06 | AC-REG-03 | T-07, T-08, T-09 | `POST /cancel-edit`, `ApplicantService.cancel_edit`, `ApplicantEditPage.cancel` | backend และ `test_TC_REG_03_1_cancel_restores_original_and_closes_form`, `test_TC_REG_03_2_cancel_all_changed_fields` ตรวจคืนข้อมูลเดิม ปิดฟอร์ม และไม่สร้าง log ผ่าน | ครบ |
| NFR-PERF-01 | ไม่มี AC | T-03, T-09 | `ApplicantService.update` | `test_AC_REG_01_save_with_audit_log_average_response_under_1_5_seconds` ผ่าน | ครบ |
| NFR-SEC-01 | ไม่มี AC | T-02, T-09 | `get_current_editor`, dependency ทุก applicant endpoint | tests ตรวจ role ต้องห้ามสำหรับ GET, PUT และ cancel ผ่าน | ครบ |
| NFR-USE-01 | ไม่มี AC | T-05, T-06, T-09 | `ApplicantEditForm` ใช้ `aria-invalid`, `aria-describedby`, field error | `test_TC_REG_02_1_reject_short_phone_and_keep_input` ตรวจ highlight, ข้อความแนะนำ และคงค่าผ่าน | ครบ |
| DOM-AUD-01 | AC-REG-01, AC-REG-02, AC-REG-03 | T-01, T-03, T-07, T-09 | schema `applicant_audit_logs`, `ApplicantService.update/cancel_edit/get_audit_log` | ตรวจ log และ `retention_until` ที่คำนวณ 3 เดือน; AC-REG-02/03 ตรวจไม่มี log | ครบ |
| DOM-TXN-01 | AC-REG-01 | T-01, T-03, T-09 | `transaction`, `ApplicantService.update` | `test_transaction_rolls_back_applicant_when_audit_insert_fails` ผ่าน | ครบ |
| SEC-RBAC-01 | AC-REG-01 | T-02, T-04, T-09 | `get_current_editor`, applicant router | tests ตรวจ role ที่อนุญาตและปฏิเสธสำหรับ GET, PUT, cancel และ identity หายผ่าน | ครบ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/applicants.py:GET /applicants/{applicant_id}/edit` | FR-REG-01, SEC-RBAC-01 | ตรงบางส่วน | แสดงข้อมูลของ ID ที่ถูกส่งมาและคืน 404 เมื่อไม่พบ แต่ไม่พบกลไกค้นหาผู้สมัครตามที่ FR-REG-01 ระบุ |
| `backend/app/api/applicants.py:GET /applicants/search` | FR-REG-01, SEC-RBAC-01 | ตรง | ค้นหาด้วยรหัสผู้สมัครหรือชื่อ-นามสกุลก่อนเปิดฟอร์ม และตรวจสิทธิ์ |
| `backend/app/api/applicants.py:PUT /applicants/{applicant_id}` | FR-REG-04, FR-REG-05, DOM-TXN-01, SEC-RBAC-01 | ตรง | validation/transaction/role guard ตรง และมี test role ต้องห้ามสำหรับ PUT |
| `backend/app/api/applicants.py:POST /applicants/{applicant_id}/validate` | FR-REG-02, FR-REG-03, NFR-USE-01 | ตรง | คืน field errors และมี frontend test ตรวจการนำไป highlight/แสดงข้อความ |
| `backend/app/api/applicants.py:POST /applicants/{applicant_id}/cancel-edit` | FR-REG-06, DOM-AUD-01, SEC-RBAC-01 | ตรง | คืนข้อมูลเดิม ไม่เขียน Applicant/Audit Log และมี test role ต้องห้าม |
| `backend/app/api/applicants.py:ApplicantUpdatePayload` | FR-REG-02, FR-REG-04, ASM-04 | ตรงบางส่วน | allowlist ฟิลด์ตรง plan; validation รูปแบบมีเฉพาะชื่อและเบอร์โทรศัพท์ตาม spec ตัวอย่าง และยังรับการแก้ไขโดยไม่ตรวจสถานะลงทะเบียนเสร็จสิ้น |
| `backend/app/services/applicant_service.py:ApplicantService.update` | FR-REG-04, FR-REG-05, DOM-AUD-01, DOM-TXN-01, ASM-02, ASM-04, ASM-06 | ตรง | update และ Audit Log อยู่ transaction เดียวกัน; ใช้ Asia/Bangkok, guard `status=completed`, retention 3 เดือน และบันทึกเฉพาะฟิลด์ที่เปลี่ยน |
| `backend/app/services/applicant_service.py:ApplicantService.cancel_edit` | FR-REG-06 | ตรง | อ่านข้อมูลเดิมโดยไม่สร้าง log |
| `backend/app/validators/applicant_validator.py:validate_applicant_payload` | FR-REG-02, FR-REG-03 | ตรง | ตรวจเบอร์ 10 หลัก/ตัวเลขและชื่อห้ามมีตัวเลข |
| `backend/app/middleware/authz.py:get_current_editor` | SEC-RBAC-01, NFR-SEC-01 | ตรง | fail-closed และอนุญาตเฉพาะ `committee`/`admin` |
| `frontend/src/api/client.js:getApplicantForEdit/updateApplicant/validateApplicant/cancelApplicantEdit` | FR-REG-01, FR-REG-02, FR-REG-04, FR-REG-06 | ตรง | ครบ route client ตามที่มี implementation |
| `frontend/src/pages/ApplicantEditPage.jsx:save/cancel` | FR-REG-03, FR-REG-04, FR-REG-06 | ตรง | มี frontend tests ตรวจ validation/save/cancel flow |
| `frontend/src/components/ApplicantEditForm.jsx:submit` | FR-REG-03, FR-REG-04, NFR-USE-01 | ตรง | frontend tests ตรวจ submit, field error semantics และผลลัพธ์ |
| `frontend/src/styles/applicant-edit.css` | FR-REG-03, NFR-USE-01 | ตรงบางส่วน | จัดธีมและ visual state ของฟอร์ม; test ตรวจ semantics ไม่ได้ตรวจ pixel styling |
| `frontend/src/main.jsx:renderPage` | FR-REG-01, SEC-RBAC-01 | ตรง | รองรับ route `/applicants/search` และ route ฟอร์มแก้ไข; authorization อยู่ backend |
| `backend/app/api/applicants.py:GET /applicants/{applicant_id}/audit-log` | DOM-AUD-01, SEC-RBAC-01 | ตรง | คืน AuditLog ของผู้สมัครและตรวจสิทธิ์ก่อนเข้าถึง |
| `backend/db/schema.sql:applicant_audit_logs` | DOM-AUD-01 | ตรง | มี `retention_until` ใน Audit Log และ service กำหนด retention 3 เดือน |

## 3. ข้อค้นพบ

ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-16 | โค้ดไม่มี FR | `backend/app/api/applicants.py:GET /applicants/search`, `frontend/src/pages/ApplicantSearchPage.jsx` | FR-REG-01, plan.md ข้อ 4, tasks.md T-03/T-04 | เพิ่ม API และหน้าค้นหาด้วย ID/ชื่อแล้ว แต่รายการ API และ task เดิมยังไม่ระบุ surface นี้ จึง trace กลับไปยังแผนงานไม่ได้ครบ | แก้ spec — ปรับ plan.md และ tasks.md ให้ครอบคลุม API และหน้าค้นหาที่เพิ่มขึ้น พร้อมระบุความเชื่อมโยงกับ FR-REG-01 |
| F-17 | test อ่อน | `backend/tests/test_AC_REG_01.py:test_AC_REG_01_save_edit_and_create_audit_log` | DOM-AUD-01, retention 3 เดือน | test ตรวจเพียงว่า `retention_until` มี timezone ไม่ได้ตรวจว่าเป็นวันเวลาหลัง `edited_at` ครบ 3 เดือนตาม policy ที่ทีมกำหนด | แก้โค้ด — เพิ่ม Test ตรวจสอบว่า retention_until ตรงกับระยะเวลาเก็บรักษา 3 เดือนตาม policy |
| F-18 | ละเมิด Constraint | `backend/app/services/applicant_service.py:ApplicantService.initialize`, `backend/db/schema.sql` | DOM-AUD-01 | `CREATE TABLE IF NOT EXISTS` ไม่เพิ่มคอลัมน์ `retention_until` ให้ฐานข้อมูลเดิมที่สร้างก่อน schema เปลี่ยน ทำให้ deployment เดิมอาจ insert Audit Log ไม่ได้ |แก้โค้ด — เพิ่ม Database Migration สำหรับฐานข้อมูลเดิม เพื่อให้มีคอลัมน์ retention_until โดยไม่กระทบข้อมูลที่มีอยู่ |

## 4. แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-03 | T-07/T-08 เพิ่ม cancel endpoint/client และซ่อนฟอร์มหลังยกเลิกพร้อมแสดงข้อมูลเดิม | อ่าน `ApplicantEditPage.cancel`, `cancelApplicantEdit` และ backend test AC-REG-03; backend test ผ่าน |
| F-04 | T-09 เพิ่ม test ให้ Audit insert ล้มเหลวแล้ว Applicant rollback และไม่มี Audit Log | `test_transaction_rolls_back_applicant_when_audit_insert_fails` ผ่าน |
| F-07 | เพิ่ม Vitest ใน `frontend/package.json` และเพิ่ม `test` script พร้อม lockfile | `npm test -- --run` ผ่าน 3 tests จาก 3 test files |
| F-05 | เพิ่ม test role ต้องห้ามสำหรับ `cancel-edit` | `test_unauthorized_applicant_role_cannot_cancel_edit` ผ่าน |
| F-06 | เพิ่ม `ApplicantEdit.test.jsx` ตรวจ save, validation, error highlight, คงค่า และ cancel flow | frontend tests ของ Applicant Edit ผ่าน 4 tests |
| F-08 | เพิ่ม backend/frontend tests ตาม `TC-REG-03-1` และ `TC-REG-03-2` | backend suite และ frontend suite ผ่าน; test ชื่อตรงตามตาราง |
| F-09 | เพิ่ม frontend assertion ตรวจ error message, `aria-invalid`, และค่า input เดิม | `test_TC_REG_02_1_reject_short_phone_and_keep_input` ผ่าน |
| F-01 | ขยาย Then ของ AC-REG-01 และ TC-REG-01-1 ให้ตรวจข้อมูลเดิมครบทุกฟิลด์ก่อนแก้ไข | `test_AC_REG_01_save_edit_and_create_audit_log` ตรวจค่าทุกฟิลด์และผ่าน |
| F-02 | เปลี่ยนกรณีไม่พบผู้สมัครของ `open_edit_form` ให้คืน 404 แทน success-shaped fallback | `test_get_edit_for_missing_applicant_returns_not_found` ผ่าน |
| F-10 | เพิ่ม `GET /applicants/{applicant_id}/audit-log` ใน router/service และเพิ่ม test ตรวจรายการ Audit Log | `test_get_audit_log_returns_all_changes` และการเรียก audit-log หลังบันทึกผ่าน |
| F-11 | เพิ่ม `test_TC_REG_03_3_cancel_without_changes` ใน backend test | test ผ่านและตรวจคืนข้อมูลเดิม/ไม่มี Audit Log |
| F-12 | เพิ่ม `GET /applicants/search`, `ApplicantService.search`, client และ `ApplicantSearchPage` ค้นหาด้วย ID/ชื่อ | `test_search_applicants_by_id_or_name` ผ่าน; frontend build ผ่าน |
| F-13 | เพิ่ม guard ปฏิเสธการ update เมื่อ `status=completed` | `test_update_rejects_completed_registration` ผ่าน |
| F-14 | เพิ่ม `AUDIT_RETENTION_MONTHS = 3`, `retention_until` ใน schema/log และแสดงใน audit response | AC-REG-01 ตรวจ `retention_until` และ test suite ผ่าน |
| F-15 | เพิ่ม frontend assertions ตรวจชื่อ อีเมล ที่อยู่ และสถานะเดิมก่อนแก้ไข | `ApplicantEdit.test.jsx` ผ่าน |
