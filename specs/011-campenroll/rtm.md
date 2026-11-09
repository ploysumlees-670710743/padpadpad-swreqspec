# RTM: สมัครเข้าร่วมค่าย (Camp Enroll)
อ้างอิง: spec.md Draft v3 (RTM ก่อน CR-011-01; เก็บเป็นหลักฐานประวัติ) | tasks.md | test-cases-pre-cr.md
สร้างด้วย /verify เมื่อ 2569-11-08 19:06 UTC | test: Backend 52 ผ่าน, Frontend 15 ผ่าน, 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
สรุป 17 IDs: ครบ 6, ยังไม่ถึง 6, รอ Q-xx 0, ช่องโหว่ 5
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `camp_enrollment.py: read_configured_camp`; `camp_enrollment_service.py: get_configured_camp`; `CampEnrollmentPage` | `test_configured_camp_api_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit` (ผ่าน) | ครบ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `enrollment_draft_service.py: save_draft, get_draft`; `EnrollmentForm`, `CampEnrollmentPage` | `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_draft_save_does_not_create_submitted_application` (ผ่าน) | ครบ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_required_fields`; `submit_application`; `post_application` | `test_application_fields_report_missing_required_values`, `test_submit_validation_failure_returns_errors_and_preserves_draft` (ผ่าน); การทดสอบ AC/UI รอ T-14/T-15 | ยังไม่ถึง |
| FR-ENR-04 | AC-ENR-01 | T-05, T-06 | `save_draft, get_draft, get_draft_document`; `EnrollmentForm`, `EnrollmentPreview` | `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit` (ผ่าน) | ครบ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | `validate_required_documents`; `submit_application`; `post_application` | `test_application_documents_report_missing_required_types`, `test_submit_validation_failure_returns_errors_and_preserves_draft`, `test_TC_ENR_03_2_failed_document_validation_preserves_draft` (ผ่าน); ทดสอบ API ตรวจ error, Draft/ไฟล์คงอยู่ และไม่มี Application; การแจ้งให้อัปโหลดใหม่บน UI และ Staff Review ยังรอ T-16/T-17 | ยังไม่ถึง |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `submit_application`; `POST /applications/submit`; `CampEnrollmentPage.handleSubmitApplication`; `EnrollmentPreview` | `test_TC_ENR_04_3_submit_complete_draft`, `test_AC_ENR_04_submit_success_sets_review_status` (ผ่านกับ fake connection); `test_AC_ENR_04_submit_ui` (ผ่านด้วย mock client); PostgreSQL จริงยังไม่ทดสอบ (F-03) | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09, T-10, T-11, T-12, T-13 | `Application.__post_init__`; `submit_application`; `CampEnrollmentPage.handleSubmitApplication`; Staff Review/API ยังไม่ทำ | `test_TC_ENR_04_3_submit_complete_draft` (ผ่านกับ fake connection; F-03); `test_AC_ENR_04_submit_ui` ตรวจข้อความสถานะ (ผ่าน); Staff Review ยังไม่มี test (F-01); AC-ENR-05 รอ T-12/T-13 | ช่องโหว่ |
| NFR-USE-01 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_required_fields`; `post_application`; UI แสดง field errors ยังไม่ทำ | `test_application_fields_report_missing_required_values`, `test_submit_validation_failure_returns_errors_and_preserves_draft` (ผ่าน); การแสดงข้อผิดพลาดใน UI รอ T-15 | ยังไม่ถึง |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | schema/model และ Draft API; API/หน้าดู Application ยังไม่ทำ | `test_enrollment_schema_foundation`, `test_draft_owner_save_load_AC_ENR_01` (ผ่าน); การเรียกดู Application รอ T-12/T-13 | ยังไม่ถึง |
| NFR-SEC-01 | AC-ENR-01, AC-ENR-05 | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`; Draft service/API; `read_application`; Staff Review ยังไม่ทำ | `test_enrollment_session_guard`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_AC_ENR_05_saved_application_status_is_visible` (ผ่านด้วย signed test cookie/fake DB); ยังไม่มีหลักฐาน Login จริงที่ผูก user_id เข้ากับ Session (F-05); Staff Review รอ T-10 | ช่องโหว่ |
| NFR-REL-01 | AC-ENR-02, AC-ENR-03, AC-ENR-04 | T-07, T-08, T-09, T-10, T-14, T-15, T-16, T-17 | `submit_application` ปฏิเสธ validation ที่ไม่ผ่านและคง Draft; Staff Review ยังไม่ทำ | `test_submit_validation_failure_returns_errors_and_preserves_draft`, `test_TC_ENR_03_2_failed_document_validation_preserves_draft` (ผ่านบางส่วน); test ใหม่ยืนยัน Draft/ไฟล์เดิมคงอยู่และไม่สร้าง Application; ยังไม่มี test ยืนยันว่า Draft ไม่แสดงใน Staff Review (F-01); submit ใช้ fake connection (F-03) | ช่องโหว่ |
| CON-ENR-01 | AC-ENR-01, AC-ENR-04 | T-04, T-09 | `get_configured_camp_id`; `read_configured_camp`; `submit_application` | `test_configured_camp_api_AC_ENR_01`, `test_TC_ENR_04_5_closed_camp_submit_is_rejected`, `test_TC_ENR_04_7_submit_without_camp_id_is_configuration_error`, `test_TC_ENR_04_8_missing_configured_camp_is_configuration_error` (ผ่าน) | ครบ |
| CON-ENR-02 | AC-ENR-01 | T-02, T-05, T-06, T-12 | `get_current_user_id`; Draft API/service; `post_application`; `read_application` | `test_enrollment_session_guard`, `test_draft_owner_save_load_AC_ENR_01`, `test_TC_ENR_04_6_submit_requires_session`, `test_AC_ENR_01_form_preview_before_submit` (ผ่านด้วย signed test cookie); Session ที่ไม่มีหรือปลอมถูกปฏิเสธ แต่ไม่พบ Login/ตัวเชื่อมที่พิสูจน์แหล่ง user_id (F-05) | ช่องโหว่ |
| CON-ENR-03 | AC-ENR-02 | T-07, T-09, T-14 | `validate_required_fields`; `submit_application` | `test_application_fields_valid_for_AC_ENR_04`, `test_application_fields_report_missing_required_values`, `test_submit_validation_failure_returns_errors_and_preserves_draft` (ผ่าน) | ครบ |
| CON-ENR-04 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16, T-17 | `validate_required_documents`; `submit_application` | `test_documents_valid_for_AC_ENR_04`, `test_application_documents_report_missing_required_types`, `test_TC_ENR_04_1_configured_required_documents_pass`, `test_TC_ENR_04_2_additional_document_does_not_fail_validation`, `test_TC_ENR_03_2_failed_document_validation_preserves_draft` (ผ่าน); validation อิง required document types ของค่าย และ submit ไม่ผ่านคง Draft/ไฟล์เดิม; การตรวจ AC/UI ของ T-16/T-17 ยังไม่ทำ | ยังไม่ถึง |
| IF-ENR-01 | AC-ENR-02, AC-ENR-04 | T-07, T-09, T-14 | `validate_application_fields`; `submit_application` | `test_application_fields_valid_for_AC_ENR_04`, `test_application_fields_report_missing_required_values`, `test_submit_validation_failure_returns_errors_and_preserves_draft` (ผ่าน) | ครบ |
| IF-ENR-02 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16 | `validate_application_documents`; `submit_application` | `test_documents_valid_for_AC_ENR_04`, `test_application_documents_report_missing_required_types`, `test_submit_validation_failure_returns_errors_and_preserves_draft`, `test_TC_ENR_03_2_failed_document_validation_preserves_draft` (ผ่าน); Draft รับเอกสารไม่ครบ และ validation ตอน submit ที่ไม่ผ่านคง Draft/ไฟล์เดิมโดยไม่สร้าง Application; T-16 ยังไม่ทำ | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/config.py: get_configured_camp_id` | CON-ENR-01 | ตรง | อ่าน `CAMP_ID` ฝั่ง Server และไม่มี fallback |
| `backend/app/api/camp_enrollment.py: GET /enrollment/camp`; `camp_enrollment_service.py: get_configured_camp` | FR-ENR-01, CON-ENR-01, CON-ENR-02 | ตรง | คืนข้อมูลจาก record ที่ตั้งค่าไว้และต้องมี Session |
| `backend/app/api/camp_enrollment.py: PUT/GET /applications/draft`; `enrollment_draft_service.py: save_draft, get_draft` | FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09 | ตรง | Draft ผูกกับ Session owner/CAMP_ID; บันทึก partial data โดยไม่ validate การส่ง |
| `backend/app/api/camp_enrollment.py: GET /applications/draft/documents/{document_id}`; `enrollment_draft_service.py: get_draft_document` | FR-ENR-04, CON-ENR-02, NFR-SEC-01, ASM-09 | ตรง | คืน bytes เฉพาะเอกสารใน Draft ของเจ้าของและค่ายที่กำหนด |
| `backend/app/api/camp_enrollment.py: POST /applications/submit`; `enrollment_submission_service.py: submit_application` | FR-ENR-03, FR-ENR-05, FR-ENR-06, FR-ENR-07, CON-ENR-01, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-REL-01 | ตรงบางส่วน | เช็คค่ายเปิด, ตรวจ Required Fields/Required Documents และเมื่อผ่านสร้าง `submitted` พร้อมย้ายไฟล์/ลบ Draft ใน transaction; `test_TC_ENR_03_2_failed_document_validation_preserves_draft` ยืนยัน error และการคง Draft/ไฟล์เดิมเมื่อเอกสารไม่ครบ; Staff Review และ PostgreSQL integration test ยังไม่ยืนยัน (F-01, F-03) |
| `backend/app/validators/enrollment_validator.py: validate_required_fields`; `document_validator.py: validate_required_documents` | FR-ENR-03, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-USE-01, NFR-REL-01, ASM-07, ASM-08 | ตรงตามข้อกำหนดที่ระบุ | ตรวจ Required Fields/Required Documents จากการตั้งค่าค่าย; ไม่ hard-code รูปแบบไฟล์หรือขนาดที่ spec ยังไม่ได้กำหนด |
| `backend/app/models/application.py`, `application_draft.py`, `application_document.py`, `camp.py`; `backend/db/schema.sql` | FR-ENR-02, FR-ENR-04, FR-ENR-07, NFR-DATA-01, NFR-REL-01, ASM-04, ASM-05, ASM-07, ASM-08, ASM-09 | ตรงตามขอบเขตที่อนุมัติ | Schema รองรับ Draft, Application `submitted` และไฟล์; `reviewed`/`rejected` คงไว้ตามคำตัดสินทีม (F-02) โดยไม่มี workflow เปลี่ยนสถานะ |
| `backend/app/middleware/auth.py: bind_session_user, get_current_user_id`; `backend/app/db/database.py`; `backend/main.py: create_app` | CON-ENR-02, NFR-SEC-01 | ตรงบางส่วน | Guard รับเฉพาะ user_id จาก signed Session, ตอบ 401 เมื่อขาด และ startup ตรวจ APP_SECRET/การเชื่อมต่อ DB; แต่ไม่พบ Login/authenticator หรือ caller ของ `bind_session_user` ใน `backend/app/` หรือ `frontend/src/`; test สร้าง signed cookie เอง จึงยังยืนยันไม่ได้ว่า identity มาจากการยืนยันตัวตนที่เชื่อถือได้ (F-05) |
| `frontend/src/pages/CampEnrollmentPage.jsx: CampEnrollmentPage, handleSubmitApplication`; `EnrollmentForm`; `EnrollmentPreview` | FR-ENR-01, FR-ENR-02, FR-ENR-04, FR-ENR-06, FR-ENR-07, CON-ENR-02, NFR-SEC-01 | ตรงบางส่วน | ฟอร์มค่ายเดียว, Draft, preview และ UI ส่ง/สถานะทำแล้ว; submit แสดงสถานะเมื่อ client resolve สำเร็จ; รายการ Staff Review ยังไม่ทำใน T-10 |
| `frontend/src/components/EnrollmentPreview.jsx: EnrollmentPreview` | FR-ENR-02, FR-ENR-04, FR-ENR-06 | ตรงบางส่วน | ปุ่มยืนยันอยู่หลัง preview; มีข้อความสถานะกำลังส่งที่ไม่มีข้อกำหนดรองรับ (F-04) |
| `frontend/src/api/client.js: createApiClient, request, submitApplication` | FR-ENR-06, FR-ENR-07, CON-ENR-02, NFR-SEC-01 | ตรง | เรียก `POST /applications/submit` ด้วย credentials และไม่มี body/camp_id; โยน error เมื่อ HTTP ไม่สำเร็จ |
| `frontend/src/__tests__/AC_ENR_04.test.jsx: test_AC_ENR_04_submit_ui` | FR-ENR-06, FR-ENR-07 | ตรงบางส่วน | ตรวจการเรียก submit, ไม่มี `camp_id` ใน fetch options และแสดง “รอตรวจสอบ”; จำลองผล API ไม่ได้ยืนยัน DB/Staff Review |
| `backend/app/api/camp_enrollment.py: GET /applications/{application_id}`; `enrollment_submission_service.py: get_application` | NFR-DATA-01, NFR-SEC-01, AC-ENR-05 | ตรงตามขอบเขต API ใน plan | Query จำกัด application_id, applicant_id จาก Session และ CAMP_ID จาก Server; T-12 ยังไม่ปิดและ T-13 ยังไม่ทำ; tests ปัจจุบันใช้ fake connection |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | test อ่อน | AC-ENR-04 / Staff Review | FR-ENR-07, NFR-REL-01 | test ยืนยันว่า Draft ไม่สร้าง Application ใหม่แล้ว แต่ยังไม่มี endpoint/test ยืนยันว่า Staff Review ไม่แสดง Draft; รอ T-10 | คงข้อค้นพบไว้ รอตรวจสอบใน T-10; Draft ต้องไม่ปรากฏใน Staff Review |
| F-03 | test อ่อน | TC-ENR-04-3 / `backend/tests/test_AC_ENR_04.py` | AC-ENR-04, FR-ENR-06, FR-ENR-07 | Tests ของการ submit ใช้ `_SubmissionFakeConnection` และจำลองผล SQL/transaction เอง; ยังไม่มีการตรวจการทำงานกับ PostgreSQL จริงตามที่ TC-ENR-04-3 ระบุ จึงยังยืนยันการทำงานของ SQL, schema และ transaction ในฐานข้อมูลจริงไม่ได้ | คงสถานะเปิดไว้เพื่อรอ Integration Test กับ PostgreSQL จริง; ห้ามระบุว่าผ่านแล้ว |
| F-04 | โค้ดไม่มี FR | `frontend/src/components/EnrollmentPreview.jsx: EnrollmentPreview` | ขอบเขต FR-ENR-06, FR-ENR-07 | ข้อความ “กำลังส่งใบสมัคร…” และการแสดงสถานะกำลังส่งเป็นพฤติกรรม/ข้อความ UI เพิ่มเติมที่ไม่มีระบุใน FR หรือ plan.md ข้อ 4; ไม่มี mockup หรือ UI requirement สำหรับข้อความนี้ | อนุมัติให้คงข้อความ "กำลังส่งใบสมัคร…" ไว้เป็น UI feedback ระหว่างรอผล Submit โดยไม่เพิ่ม Functional Requirement ใหม่ |
| F-05 | test อ่อน | `backend/app/middleware/auth.py: bind_session_user`; `backend/main.py: create_app`; `backend/tests/test_enrollment_session_guard.py` | CON-ENR-02, NFR-SEC-01 | โค้ดตรวจ signed Session และปฏิเสธ Session ที่ไม่มี/ปลอมได้ แต่ไม่พบ Login/authenticator หรือการเรียก `bind_session_user` ที่นำ `user_id` จากการยืนยันตัวตนจริงมาใส่ Session; tests สร้าง signed cookie ด้วย test secret เอง จึงไม่พิสูจน์แหล่งที่มาของ identity ในระบบจริง ต้องยืนยัน integration กับกระบวนการ Login ที่เชื่อถือได้ก่อนถือว่า access control สมบูรณ์ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-02 | ปิดข้อค้นพบตามคำตัดสินทีม: อนุมัติให้คงสถานะ `reviewed`/`rejected` ใน Database Schema เพื่อรองรับอนาคต โดยห้าม Implement Workflow ตรวจสอบ อนุมัติ หรือปฏิเสธใน Feature นี้; ไม่แก้ Production Code | ทีมยืนยันคำตัดสินเมื่อ 2026-11-08; สถานะเหล่านี้คงอยู่ใน model/schema และไม่มี workflow เปลี่ยนสถานะ |
| F-06 | เพิ่ม `test_TC_ENR_03_2_failed_document_validation_preserves_draft` เพื่อยืนยัน error 422, document type ที่ขาด, Draft/ไฟล์เดิมคงอยู่ และไม่มี Application | รัน `cd backend && pytest -v` ผ่าน 52 tests; test ใหม่ตรวจทุกผลลัพธ์ดังกล่าวผ่าน fake connection |

## 5. มติการเลื่อน T-10 และปรับ Dependency
- ทีมเลือก PostgreSQL เป็นแหล่งจัดเก็บและตรวจ Role สำหรับ Camp Enrollment แต่ยังไม่มี Login ที่ยืนยันตัวตนจริงเพื่อยืนยัน `user_id` ใน Session; คง T-10 เป็น Deferred จนกำหนด Authentication และ Migration/กระบวนการดูแล Role ได้
- T-11 ไม่เรียก Staff Review API: ใช้ `POST /applications/submit` โดยตรงและแสดงสถานะจากผล submit จึงตัด dependency T-10 ออกได้โดยไม่เปลี่ยน Requirement หรือ AC
- T-12 ไม่ขึ้นกับ T-10; T-13 ทำหลัง T-11 และ T-12; ตามมติทีมในข้อ 9 T-14/T-16 ตรวจ Submit ที่ไม่ผ่านและไม่มี Application โดยไม่ต้องรอ T-10; T-15 รอ T-14 และ T-17 รอ T-16 ตามลำดับ
- คง F-01 และ F-03 เป็นข้อค้นพบเปิดตามคำตัดสินทีม; ไม่มีการอ้างว่าการ Integration Test กับ PostgreSQL ผ่านแล้ว

## 6. มติทีมตรวจรับ T-02 และ T-09
- 2569-11-08: ทีมตรวจรับ Implementation ของ T-02 และ T-09 ตามขอบเขตที่ทำเสร็จแล้ว และอนุมัติเปลี่ยนสถานะใน `tasks.md` เป็น “เสร็จ”; ไม่มีการรัน Verify ซ้ำตามคำขอ
- การตรวจรับ T-02 ไม่ได้ยืนยันว่ามี Login หรือว่าต้นทาง `user_id` ใน Session ผ่านการยืนยันตัวตนจริง; คง F-05 เป็นข้อจำกัดที่ยังเปิดอยู่
- การตรวจรับ T-09 ไม่ได้ยืนยันการทำงานกับ PostgreSQL จริง; คง F-03 เปิดรอ Integration Test กับ PostgreSQL และไม่อ้างว่าผ่านแล้ว
- ไม่เปลี่ยนผลทดสอบ สถานะ RTM หรือข้อค้นพบอื่นจากผล Verify ล่าสุด

## 7. มติทีมตรวจรับ T-03, T-11 และ T-12
- 2569-11-08: ทีมตรวจรับ T-03, T-11 และ T-12 จากเกณฑ์รับงานและหลักฐานทดสอบ/ผลตรวจเดิม; อนุมัติเปลี่ยนสถานะทั้งสามใน `tasks.md` เป็น “เสร็จ”; ไม่รัน Verify หรือ Tests ซ้ำ
- T-03: หลักฐานเดิมบันทึก `test_frontend_bootstrap` ผ่าน, Frontend tests/build ผ่าน และ Vite เปิดหน้าได้
- T-11: หลักฐานเดิมบันทึก `test_AC_ENR_04_submit_ui` ผ่าน โดยยืนยันการเรียก Submit โดยไม่ส่ง `camp_id` และแสดงสถานะ “รอตรวจสอบ”; ผล Verify เดิมบันทึก Frontend tests ผ่าน
- T-12: หลักฐานเดิมจาก `test_AC_ENR_05_saved_application_status_is_visible` และ tests เจ้าของอื่น/ไม่มี Session ผ่าน 3 tests ด้วย fake connection; ไม่ถือเป็น PostgreSQL Integration
- คง F-03 เปิดรอ Integration Test กับ PostgreSQL จริง และ F-05 เปิดเนื่องจากยังไม่มีหลักฐาน Login/identity binding จริง; คง Findings อื่นตามเดิม
- การตรวจรับทั้งสาม Task ไม่ได้เปลี่ยนข้อจำกัดดังกล่าว และไม่ใช่การยืนยันว่า Login หรือ PostgreSQL Integration ผ่าน

## 8. มติทีมตรวจรับ T-07 และ T-08
- 2569-11-08: ทีมตรวจหลักฐานและอนุมัติรับ Implementation ของ T-07 และ T-08 ตามขอบเขตที่กำหนด; เปลี่ยนสถานะใน `tasks.md` เป็น “เสร็จ”
- T-07: รับตามหลักฐานเดิมของ field validation จาก `CAMP_ID` และการระบุ required fields ที่ขาด; การทดสอบ AC-ENR-02 แบบครบ Submit/UI ยังเป็นงาน T-14/T-15
- T-08: รับตามหลักฐานเดิมของการตรวจ `document_type` เทียบกับ `required_documents`; ตามขอบเขตที่ทีมอนุมัติ ไม่ตรวจ MIME/extension/size และไม่ปฏิเสธเอกสารเพิ่มเติม
- คง F-03 เปิดเพื่อรอ Integration Test กับ PostgreSQL จริง และ F-05 เปิดเพราะยังไม่มีหลักฐาน Login/identity binding จริง; คง Findings อื่นตามเดิม
- ไม่รัน Tests หรือ Verify ซ้ำ และไม่แก้ Production Code

## 9. มติทีมปรับ Dependency ของ T-14 และ T-16
- 2569-11-08: ทีมอนุมัติ Dependency ที่เสนอ; T-14 ต้องทำหลัง T-07, T-08, T-09 และ T-16 ต้องทำหลัง T-08, T-09
- Tests ของ T-14/T-16 ตรวจผล `POST /applications/submit` ที่ไม่ผ่าน, การคง Draft/ไฟล์เดิม และไม่มี Application ถูกสร้าง; ไม่ต้องเรียก `GET /applications/review` จึงไม่ต้องพึ่ง T-10
- คง T-10 เป็น Deferred; Findings เดิมยังเปิดตามจริง โดยเฉพาะ F-01 (Staff Review ยังไม่มี test) และ F-03 (รอ PostgreSQL Integration); ไม่เปลี่ยน Acceptance Criteria หรือเกณฑ์เสร็จของ T-14/T-16
- ไม่รัน Tests หรือ Verify ซ้ำ และไม่แก้ Production Code

## 10. มติทีมตรวจรับ T-14 และ T-16
- 2569-11-08: ทีมตรวจรับ T-14 และ T-16 โดยยอมรับผล Unit Test ตามขอบเขตงาน; เปลี่ยนสถานะทั้งสอง Task ใน `tasks.md` เป็น “เสร็จ” โดยไม่รัน Tests หรือ Verify ซ้ำ
- หลักฐานเดิมของ T-14/T-16 ใช้ fake connection และยืนยัน Submit ไม่ผ่าน, Draft/ไฟล์เดิมคงอยู่ และไม่มี Application ถูกสร้าง; ไม่ถือเป็นหลักฐาน Staff Review หรือ PostgreSQL Integration
- คง F-03 (PostgreSQL Integration) และ F-05 (Authentication) เป็นข้อค้างเดิม; คง T-10 เป็น Deferred และคง Findings อื่นตามจริง
- ไม่แก้ Production Code หรือ Feature อื่น

## 11. มติทีมตรวจรับ T-06
- 2569-11-08: ทีมตรวจรับ T-06 ตามหลักฐานเดิม และอนุมัติเปลี่ยนสถานะจาก “เสร็จ รอทีมตรวจ” เป็น “เสร็จ” ใน `tasks.md`
- ไม่รัน Tests หรือ Verify ซ้ำ; ไม่แก้ Production Code และไม่เปลี่ยนสถานะงานอื่น

## 12. มติทีมยืนยันการตรวจรับ T-16
- 2569-11-08: ทีมยืนยันตรวจรับ T-16 โดยยอมรับผลทดสอบเดิม 3 passed ตามขอบเขตงาน; สถานะใน `tasks.md` คงเป็น “เสร็จ” ตามมติรับงานก่อนหน้า
- ไม่รัน Tests หรือ Verify ซ้ำ; คง Findings เดิมและ T-10 เป็น Deferred; ผลทดสอบ fake connection ไม่ยืนยัน PostgreSQL Integration หรือ Staff Review
- ไม่แก้ Production Code

## 10. RTM ปัจจุบัน: CR-011-01 (spec Draft v4)

ส่วนที่ 1–9 ข้างต้นเป็นหลักฐานก่อน Change Request และไม่ใช้แทนการตรวจ CR-011-01. ตารางนี้เป็น traceability ปัจจุบัน โดยคง Requirement/AC/Task IDs เดิมและเปลี่ยนความหมายที่เกี่ยวข้องกับการแนบเอกสารตามมติทีม. ชุดทดสอบเต็มหลัง CR ผ่าน Backend 64 tests และ Frontend 24 tests; Frontend Build สำเร็จ.

| ID | AC ปัจจุบัน | Tasks ที่เกี่ยวข้อง | Code/Test ที่ตรวจหลัง CR-011-01 | สถานะ |
|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `get_configured_camp`; `test_enrollment_configured_camp.py`, `AC_ENR_01.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | JSON `{form_data}` Draft; `test_enrollment_draft.py`, `AC_ENR_01.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | HTTP 422/field errors; `test_AC_ENR_02.py`, `AC_ENR_02.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-04 | AC-ENR-03 | T-07, T-08, T-16 | year_level 1–6/other; `test_enrollment_data_validation.py`, `AC_ENR_01.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | allergy no/yes/conditional details; `test_AC_ENR_03.py`, `AC_ENR_03.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | valid form Submit without documents; `test_AC_ENR_04.py`, `AC_ENR_04.test.jsx` | ผ่านในชุดเต็ม |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09 ถึง T-13 | submitted status and GET Application; `test_AC_ENR_04.py`, `test_AC_ENR_05.py`, frontend AC-04/05 | ผ่านในชุดเต็ม |
| CON-ENR-01 | AC-ENR-01, AC-ENR-04 | T-04, T-09 | server-side CAMP_ID; configured camp/submit tests | ผ่านในชุดเต็ม |
| CON-ENR-02 | AC-ENR-01 | T-02, T-05, T-06, T-12 | Session ownership; `test_enrollment_draft.py`, `test_enrollment_session_guard.py` | ผ่านในชุดเต็ม |
| CON-ENR-03 | AC-ENR-02 | T-07, T-09, T-14 | Required fields + partial Draft; validation/submit tests | ผ่านในชุดเต็ม |
| CON-ENR-04 | AC-ENR-03 | T-08, T-09, T-16, T-17 | Year-level/allergy rules; backend and frontend AC-03 tests | ผ่านในชุดเต็ม |
| IF-ENR-01 | AC-ENR-02, AC-ENR-04 | T-07, T-09, T-14 | Submit validates before persistence; `test_AC_ENR_02.py`, `test_AC_ENR_04.py` | ผ่านในชุดเต็ม |
| IF-ENR-02 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16 | Submit validates year/allergy; no document validation | ผ่านในชุดเต็ม |
| NFR-USE-01 | AC-ENR-02, AC-ENR-03 | T-07, T-15, T-17 | Errors below fields; `AC_ENR_02.test.jsx`, `AC_ENR_03.test.jsx` | ผ่านในชุดเต็ม |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | Draft/GET Application data; legacy document schema retained; `test_AC_ENR_05.py` | ผ่านในชุดเต็ม |
| NFR-SEC-01 | AC-ENR-01, AC-ENR-05 | T-02, T-05, T-06, T-10, T-12, T-13 | owner-scoped Draft/Application; session tests | ผ่านในชุดเต็ม; Login จริงยังไม่ยืนยัน |
| NFR-REL-01 | AC-ENR-02, AC-ENR-03, AC-ENR-04 | T-07 ถึง T-09, T-14 ถึง T-17 | failed validation preserves Draft; no Application until valid | ผ่านในชุดเต็ม |

## 13. ผล /verify ปัจจุบัน 2569-11-09 05:43 UTC

ส่วนก่อนหน้านี้เป็นประวัติ ไม่ใช่ผลทดสอบปัจจุบัน ตารางต่อไปใช้ spec Draft v4 และคงมติทีมในข้อค้นพบเดิมทุกประการ โดยไม่เปลี่ยนสถานะ T-10 ที่ Deferred. ไม่มี shared constraints หรือ mockup ในโฟลเดอร์ที่ระบุ. Backend 64 ผ่าน 0 ไม่ผ่าน (warning 1 รายการ); Frontend 24 ผ่าน 3 ไม่ผ่าน. Test ใช้ fake connection/mock ไม่ใช่ PostgreSQL Integration.

### ตามรอยไปข้างหน้า

สรุป 17 IDs: ครบ 0, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 17. คอลัมน์ AC แสดงเฉพาะการอ้าง ID โดยตรงใน spec; AC ที่ตรวจพฤติกรรมทางอ้อมระบุในคอลัมน์ test.

| ID | AC ที่อ้างโดยตรง | task | โค้ด | test และหลักฐาน | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `get_configured_camp`, `CampEnrollmentPage` | `test_configured_camp_api_AC_ENR_01`, `AC_ENR_01.test.jsx` ผ่าน; Then เรื่องกลับมาโหลด Demo Draft ยังขาด F-09 | ช่องโหว่ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `save_draft`, `get_draft`, `EnrollmentForm` | `test_draft_owner_save_load_AC_ENR_01` ผ่านด้วย fake DB; F-03, F-09 | ช่องโหว่ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_enrollment_form`, `post_application` | `test_submit_validation_failure_returns_errors_and_preserves_draft`, `AC_ENR_02.test.jsx` ผ่าน; ตรวจรายการเจ้าหน้าที่รอ T-10/F-01 | ช่องโหว่ |
| FR-ENR-04 | AC-ENR-03 | T-07, T-08, T-16 | validator และ `EnrollmentForm` | `test_other_year_level_requires_and_accepts_a_detail` ผ่าน; ช่อง other บน UI ไม่มี test F-10 | ช่องโหว่ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | validator, `handleFieldChange` | `test_food_allergy_yes_requires_details`, `AC_ENR_03.test.jsx` ผ่าน; ข้อมูลชนิดอื่นหลุด validation F-08 | ช่องโหว่ |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `submit_application`, `handleSubmitApplication` | `test_AC_ENR_04_submit_success_sets_review_status`, `AC_ENR_04.test.jsx` ผ่านแบบ fake/mock; F-03 และ Then ฝั่ง UI มี test ล้ม F-07 | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04 | T-09–T-13 | `submit_application`, `ApplicantApplicationPage` | backend AC-04 ผ่านแบบ fake; UI navigation ไม่ผ่าน F-07; Staff Review รอ T-10/F-01 และ DB จริง F-03 | ช่องโหว่ |
| NFR-USE-01 | ไม่มี AC | T-07, T-09, T-14, T-15 | `EnrollmentForm`, `getFieldErrors` | AC-02/03 ตรวจ error UI ผ่านทางอ้อม; ความครอบคลุม AC-03 มี F-10 | ช่องโหว่ |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | `get_draft`, `get_application`, `ApplicantApplicationPage` | backend AC-05 ผ่าน fake; UI AC-05 ไม่ผ่าน F-07; F-03/F-09 | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`, `get_application` | session/owner tests ผ่าน signed test cookie; Login จริง F-05, staff T-10/F-01 | ช่องโหว่ |
| NFR-REL-01 | ไม่มี AC | T-07–T-10, T-14–T-17 | `submit_application` | validation failure test ผ่าน fake; F-01, F-03, F-08 | ช่องโหว่ |
| CON-ENR-01 | ไม่มี AC | T-04, T-09 | `get_configured_camp_id`, `submit_application` | configured camp/closed camp tests ผ่าน fake; persistence จริง F-03 | ช่องโหว่ |
| CON-ENR-02 | ไม่มี AC | T-02, T-05, T-06, T-12 | session guard, Draft API | owner/session tests ผ่าน signed cookie; แหล่ง identity จริง F-05 | ช่องโหว่ |
| CON-ENR-03 | ไม่มี AC | T-07, T-09, T-14 | `validate_enrollment_form`, `save_draft` | required fields และ partial Draft tests ผ่าน fake; persistence จริง F-03 | ช่องโหว่ |
| CON-ENR-04 | ไม่มี AC | T-08, T-09, T-16, T-17 | validator และ UI | AC-03 tests ผ่านบางส่วน; F-08 และ F-10 | ช่องโหว่ |
| IF-ENR-01 | ไม่มี AC | T-07, T-09, T-14 | `submit_application` | failure preserves Draft และ success tests ผ่าน fake; DB จริง F-03 | ช่องโหว่ |
| IF-ENR-02 | ไม่มี AC | T-08, T-09, T-16 | validator, `submit_application` | allergy/year tests ผ่านบางส่วน; F-08/F-10 | ช่องโหว่ |

### ตามรอยย้อนกลับ

| โค้ด / endpoint หรือฟังก์ชันหลัก | อ้าง ID | ผลตรวจ |
|---|---|---|
| `GET /enrollment/camp`, `get_configured_camp` | FR-ENR-01, CON-ENR-01/02 | ใช้ CAMP_ID และ session; tests ใช้ fake |
| `GET/PUT /applications/draft`, `save_draft`, `get_draft` | FR-ENR-02, CON-ENR-02, ASM-09 | ตรวจเจ้าของและ whitelist; DB จริง/identity จริง F-03/F-05 |
| `POST /applications/submit`, `submit_application` | FR-ENR-03–07, CON-ENR-01/03/04, IF-ENR-01/02 | ตรวจค่ายและข้อมูลก่อน insert; detach legacy document FK ตาม plan; F-03/F-08 |
| `GET /applications/{application_id}`, `get_application` | NFR-DATA-01, NFR-SEC-01 | query จำกัดเจ้าของและ CAMP_ID; test ผ่าน fake |
| `GET /applications/review` | FR-ENR-07 | ไม่พบ implementation; T-10 Deferred/F-01 ไม่จัดเป็นงานที่เสร็จแล้ว |
| `get_current_user_id`, `bind_session_user` | CON-ENR-02, NFR-SEC-01 | ตรวจ signed session แต่ยังไม่มีหลักฐาน identity binding จริง F-05 |
| `validate_enrollment_form`, `validate_form_field_names` | FR-ENR-03–05, CON-ENR-03/04 | ตรวจ required/year/allergy และปฏิเสธ field นอก whitelist; F-08 |
| `EnrollmentForm`, `EnrollmentPreview`, `CampEnrollmentPage` | FR-ENR-01–06 | ฟอร์มและ error UI; conditional year other ขาด test F-10 |
| `EnrollmentFlow`, `ApplicantApplicationPage`, `createApiClient` | FR-ENR-07, NFR-DATA-01 | ส่ง ID ผ่าน URL แล้ว GET; UI tests ล้ม F-07 |
| `createDemoApiClient` | FR-ENR-01–07, ASM-08 | Mock ไม่เรียก Backend แต่ Draft ไม่คงหลังสร้าง client ใหม่ F-09; conditional validation F-08 |
| Model `Application`, `ApplicationDraft`, `ApplicationDocument`, `Camp` | FR-ENR-02/07, ASM-08/09 | โครงสร้างเดิมและเอกสาร legacy; F-03 ยังไม่ยืนยัน SQL/transaction จริง |

### ข้อค้นพบปัจจุบัน

ข้อค้นพบ F-01, F-03 และ F-05 ยังคงเปิดตามตารางประวัติข้อ 3 และข้อความ “ทีมตัดสิน” เดิมไม่เปลี่ยน; F-04 ทีมอนุมัติแล้วจึงไม่เพิ่มซ้ำ. F-02 และ F-06 เก็บเป็นประวัติในหัวข้อ “แก้แล้ว” เดิม; F-06 เป็นหลักฐานก่อน CR ไม่ใช้ยืนยันเงื่อนไขแพ้อาหารหลัง CR.

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-07 | test อ่อน | `AC_ENR_05.test.jsx`, `AC_ENR_04_05_navigation.test.jsx` | AC-ENR-04, AC-ENR-05, NFR-DATA-01 | 3 tests ล้ม `Found multiple elements with the text: รอตรวจสอบ` ก่อนถึง assertions ข้อมูล/รีเฟรช เพราะ UI แสดงข้อความในขั้นตอน Badge และสรุป; ผลรอบนี้ยังยืนยัน Then จาก tests เหล่านี้ไม่ได้ | |
| F-08 | ละเมิด Constraint | `enrollment_validator.py: validate_enrollment_form`, `demoClient.js: validateForm` | FR-ENR-05, CON-ENR-04, IF-ENR-02, NFR-REL-01 | เมื่อ `food_allergy=no` และ `food_allergy_details` เป็น array เช่น `["แพ้ถั่ว"]`, `_has_text`/`hasText` เป็น false ทำให้ validation ผ่านและข้อมูลค้างถูกเก็บไปกับใบสมัคร; ตรวจ validator ด้วย input นี้ได้ errors `[]`; tests ปัจจุบันตรวจเฉพาะข้อความ | |
| F-09 | test อ่อน | `demoClient.js: createDemoState/saveDraft`, `App.jsx: DemoApp` | FR-ENR-02, AC-ENR-01, NFR-DATA-01, ASM-08/09 | Demo เก็บ Draft ในหน่วยความจำ client เท่านั้น; รีเฟรชสร้าง client ใหม่แล้ว `getDraft` คืน 404 แม้ก่อนหน้านั้นบันทึกสำเร็จ; `demoClient.test.js` ตรวจโหลดภายใน instance เดิมเท่านั้น | |
| F-10 | test อ่อน | `frontend/src/__tests__/AC_ENR_03.test.jsx`, `EnrollmentForm.jsx` | FR-ENR-04, AC-ENR-03, NFR-USE-01 | Backend test ตรวจ `other` ว่าง/มีรายละเอียด แต่ไม่พบ frontend test ที่เลือก `other` และ assert ช่องรายละเอียดปรากฏหรือ error ใต้ช่อง; AC-03 Then ส่วน UI นี้ยังไม่มีหลักฐานอัตโนมัติ | |

### ขอบเขตและหลักฐานที่ยังไม่ยืนยัน

- ไม่ได้เชื่อม PostgreSQL, login จริง หรือ Staff Review; T-10 ยัง Deferred. Test Backend 64 ผ่านไม่ใช่หลักฐาน integration จริง.
- `/verify` ครั้งนี้ไม่แก้โค้ดหรือ test; ไฟล์ผลชุดทดสอบ Frontend บันทึก 12 test files: 10 ผ่าน 2 ไม่ผ่าน; 27 tests: 24 ผ่าน 3 ไม่ผ่าน.
- การอ่านเชิงลึกเน้นโค้ดและ tests ที่เกี่ยวข้องกับ Feature 011 และข้อค้นพบข้างต้น ยังไม่ได้อ่านเนื้อหาทุกบรรทัดของทุกไฟล์ใน `backend/app/`, `frontend/src/` และ tests ของทุกฟีเจอร์ จึงยังไม่ถือว่าการตามรอยย้อนกลับครบทุกฟังก์ชันหรือทุกข้อมูลตามขอบเขตเต็มของ /verify.

## 14. ผล /verify ปัจจุบัน 2569-11-09 09:06 UTC

ผลส่วนนี้ใช้แทนข้อสรุปปัจจุบันในข้อ 13; ข้อ 1–13 คงไว้เป็นประวัติ และไม่เปลี่ยนมติทีมเดิม. ตรวจ spec Draft v4, plan, tasks, test-cases, RTM, AGENTS.md และ source/tests ทั้งหมดใน `backend/app/`, `frontend/src/`, `backend/tests/`, `frontend/src/__tests__/`; ไม่พบ `specs/000-shared/` หรือ mockup HTML สำหรับ Feature 011.

รัน `cd backend && pytest -v`: 70 passed, 0 failed, 1 Starlette deprecation warning. รัน `cd frontend && npm test`: 12 test files passed, 31 passed, 0 failed. Backend tests ใช้ fake connection เป็นหลัก ไม่ใช่ PostgreSQL Integration; Demo flow ทดสอบผ่าน Mock API โดยไม่เรียก Backend.

### ตามรอยไปข้างหน้า

สรุป 17 IDs: ครบ 4, ยังไม่ถึง 0, รอ Q-xx 0, ช่องโหว่ 13. ช่องโหว่ที่ยังเปิดคือ F-01, F-03, F-05 และ F-08; สถานะที่ตัดสินจาก F-ID อิงเฉพาะ ID ที่เกี่ยวข้อง.

| ID | AC ที่อ้างโดยตรง | task | โค้ด | test และหลักฐาน | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `get_configured_camp`, `CampEnrollmentPage`, `DemoApp` | configured camp/UI tests ผ่าน; Demo เปิดฟอร์มตรงและมีการทดสอบโหลด Draft หลังสร้าง client ใหม่; การทดสอบ Database จริง/identity ยังติด F-03/F-05 | ช่องโหว่ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `save_draft`, `get_draft`, `EnrollmentForm`, `createDemoApiClient` | Draft owner/API tests ผ่าน fake; Demo `localStorage` persistence, applicant-specific keys และ restore tests ผ่าน; Database/identity จริง F-03/F-05 | ช่องโหว่ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_enrollment_form`, `submit_application`, `CampEnrollmentPage`, `EnrollmentForm` | Backend required-field/422/preserve-Draft tests และ `AC_ENR_02.test.jsx` ผ่าน; ยังพิสูจน์ส่วน Staff Review ไม่ได้ (F-01/T-10) | ช่องโหว่ |
| FR-ENR-04 | AC-ENR-03 | T-07, T-08, T-16, T-17 | `validate_enrollment_form`, `EnrollmentForm`, `handleFieldChange` | Backend 1–6/other/invalid tests ผ่าน; `AC_ENR_03.test.jsx` ตรวจแสดงช่อง other, error ใต้ช่อง และ submit หลังกรอกรายละเอียดผ่าน | ครบ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `handleFieldChange` | Backend และ UI allergy tests ผ่าน; Backend ยอมรับ non-string details เมื่อ allergy=`yes` ขณะที่ Demo validation ต่างกัน (F-08) | ช่องโหว่ |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `submit_application`, `handleSubmitApplication`, `EnrollmentPreview` | `test_AC_ENR_04.py` ใช้ fake connection และ UI submit/status tests ผ่าน; SQL/transaction กับ PostgreSQL จริงยังไม่ยืนยัน (F-03) | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09 ถึง T-13 | `submit_application`, `get_application`, `ApplicantApplicationPage` | Submit/status และหน้า Applicant ผ่าน tests; `GET /applications/review` ยังไม่มีเพราะ T-10 Deferred (F-01); Database integration F-03 | ช่องโหว่ |
| NFR-USE-01 | AC-ENR-02, AC-ENR-03 | T-07, T-15, T-17 | `getFieldErrors`, `EnrollmentForm` | Frontend tests ตรวจ field error, `aria-invalid`, error text ใต้ allergy/year-level fields; tests ผ่าน | ครบ |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | Draft/Application services, `ApplicantApplicationPage`, `createDemoApiClient` | Draft/Application display และ Demo refresh tests ผ่าน; Backend ใช้ fake connection จึงยังยืนยัน persistent storage จริงไม่ได้ (F-03) | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`, `get_draft`, `get_application` | Owner/session tests ผ่านด้วย signed test cookie; ไม่พบ Login integration ที่ผูก identity จริง (F-05); staff route ยัง Deferred | ช่องโหว่ |
| NFR-REL-01 | ไม่มี AC | T-07–T-10, T-14–T-17 | `submit_application`, `validate_enrollment_form`, `validateForm` | Required/conditional validation tests ผ่าน; non-string allergy details เมื่อเลือก yes ยังผ่าน Backend validation ได้ (F-08); persistence tests ใช้ fake (F-03) | ช่องโหว่ |
| CON-ENR-01 | AC-ENR-01, AC-ENR-04 | T-04, T-09 | `get_configured_camp_id`, `get_configured_camp`, `submit_application` | Configured camp, no-fallback, missing-config/closed-camp tests ผ่าน | ครบ |
| CON-ENR-02 | ไม่มี AC | T-02, T-05, T-06, T-12 | `get_current_user_id`, Draft/Application API | Session/owner isolation tests ผ่านด้วย signed test cookie; แหล่ง identity จาก Login จริงยังไม่ยืนยัน (F-05) | ช่องโหว่ |
| CON-ENR-03 | ไม่มี AC | T-07, T-09, T-14 | `validate_enrollment_form`, `save_draft` | Required fields ถูกตรวจตอน Submit และ Draft รับข้อมูล partial ตาม Backend tests; tests ผ่าน | ครบ |
| CON-ENR-04 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `submit_application` | year/allergy validation tests ผ่าน; Backend รับ non-string details ใน allergy=`yes` และ Mock API มี validation ต่างกัน (F-08) | ช่องโหว่ |
| IF-ENR-01 | AC-ENR-02, AC-ENR-04 | T-07, T-09, T-14 | `validate_application_fields`, `submit_application` | Invalid submit คืน field errors/คง Draft; successful submit tests ผ่านด้วย fake connection จึงยังไม่ยืนยัน transaction จริง (F-03) | ช่องโหว่ |
| IF-ENR-02 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16 | `validate_enrollment_form`, `validateForm`, `submit_application` | year/allergy conditions ถูกตรวจ; non-string details เมื่อ allergy=`yes` ยังผ่าน Backend validation และ Mock API behavior ไม่ตรงกัน (F-08) | ช่องโหว่ |

### ตามรอยย้อนกลับ

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/config.py: get_configured_camp_id`; `GET /enrollment/camp`; `get_configured_camp` | FR-ENR-01, CON-ENR-01/02 | ตรง | ใช้ CAMP_ID server-side; tests ยืนยัน no-fallback และ configuration errors |
| `GET/PUT /applications/draft`; `save_draft`, `get_draft` | FR-ENR-02, CON-ENR-02/03, NFR-DATA-01, NFR-SEC-01 | ตรงบางส่วน | Owner/session-scoped JSON Draft และ partial saves; DB จริง F-03, identity binding จริง F-05 |
| `POST /applications/submit`; `submit_application` | FR-ENR-03–07, CON-ENR-01/03/04, IF-ENR-01/02, NFR-REL-01 | ตรงบางส่วน | ตรวจค่ายและข้อมูลก่อนสร้าง `submitted`; fake connection ยังไม่ยืนยัน SQL/transaction จริง F-03; F-08 เหลือการตรวจชนิด allergy detail |
| `GET /applications/{application_id}`; `get_application` | FR-ENR-07, NFR-DATA-01, NFR-SEC-01 | ตรง | Query จำกัดเจ้าของและ CAMP_ID; tests ใช้ fake connection |
| Staff Review `GET /applications/review` | FR-ENR-07, NFR-REL-01 | ยังไม่ถึง | ไม่พบ implementation; T-10 Deferred ตาม blocker เดิม (F-01) |
| `get_current_user_id`, `bind_session_user`, `create_app` | CON-ENR-02, NFR-SEC-01 | ตรงบางส่วน | Guard ตรวจ signed Session/401; ไม่พบ Login/authenticator ที่ผูก user identity จริง (F-05) |
| `EnrollmentForm`, `EnrollmentPreview`, `CampEnrollmentPage` | FR-ENR-01–06, NFR-USE-01 | ตรง | ฟอร์ม/conditional details, Draft, preview และ field errors; AC-03 year-level other UI test เพิ่มแล้ว |
| `EnrollmentFlow`, `ApplicantApplicationPage`, `createApiClient` | FR-ENR-07, NFR-DATA-01 | ตรง | Submit navigation และ Application view/Refresh ผ่าน Frontend tests |
| `createDemoApiClient`, `DemoApp` | FR-ENR-01–07, ASM-08/09 | ตรงบางส่วน | ใช้ localStorage และ applicant-specific keys, ไม่เรียก Backend; F-08 Mock validation ยังไม่ตรง Backend สำหรับ details ชนิดไม่ใช่ข้อความ |
| `Application`, `ApplicationDraft`, `ApplicationDocument`, `Camp`; `backend/db/schema.sql` | FR-ENR-02/07, NFR-DATA-01, ASM-08/09 | ตรงตามขอบเขตที่อนุมัติ | คง legacy document schema/data ตาม plan; การทำงานกับ PostgreSQL จริงยังไม่ยืนยัน F-03 |

### ข้อค้นพบปัจจุบัน

F-01, F-03 และ F-05 ยังคงเปิด โดยคงข้อความ “ทีมตัดสิน” เดิมตามตารางประวัติข้อ 3; F-04 ทีมอนุมัติให้คง UI feedback แล้ว. F-07, F-09 และ F-10 แก้แล้วและไม่ถือเป็นข้อค้นพบปัจจุบัน. F-08 ยังคงเปิดจากความไม่สอดคล้องระหว่าง Backend และ Mock API.

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | test อ่อน | Staff Review / T-10 | FR-ENR-07, NFR-REL-01 | ไม่พบ `GET /applications/review` หรือหน้าเจ้าหน้าที่ จึงยังยืนยันการแสดงเฉพาะ Application ที่ส่งแล้วไม่ได้; T-10 ยัง Deferred | คงข้อค้นพบไว้ รอตรวจสอบใน T-10; Draft ต้องไม่ปรากฏใน Staff Review |
| F-03 | test อ่อน | Backend persistence/submit tests | AC-ENR-04, FR-ENR-06, FR-ENR-07 | Backend tests ทั้งชุดใช้ fake connection เป็นหลัก; ไม่ได้ยืนยัน SQL, schema และ transaction กับ PostgreSQL จริง | คงสถานะเปิดไว้เพื่อรอ Integration Test กับ PostgreSQL จริง; ห้ามระบุว่าผ่านแล้ว |
| F-05 | test อ่อน | Session identity / Login integration | CON-ENR-02, NFR-SEC-01 | ตรวจ signed Session/owner ได้ แต่ไม่มีหลักฐานว่า Login ที่เชื่อถือได้เป็นผู้ผูก `user_id` ใน Session | |
| F-08 | ละเมิด Constraint | `backend/app/validators/enrollment_validator.py: validate_enrollment_form`; `frontend/src/api/demoClient.js: validateForm` | FR-ENR-05, CON-ENR-04, IF-ENR-02, NFR-REL-01 | เมื่อ `food_allergy=yes` และ `food_allergy_details` เป็น array/object ที่ไม่ใช่ข้อความ Backend มองว่าเป็นรายละเอียดที่มีค่าและอาจผ่าน submission validation; Mock API ปฏิเสธค่าชนิดเดียวกันว่าไม่มีรายละเอียด ทำให้ API contract/conditional validation ไม่สอดคล้อง. Tests ปัจจุบันเพิ่มกรณี non-string สำหรับ `no` แต่ยังไม่ตรวจกรณี `yes` | |

### แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-07 | ปรับ Frontend tests ให้เลือก status badge โดยเฉพาะ ไม่ชนกับข้อความ “รอตรวจสอบ” ซ้ำในหน้า Applicant | `npm test` ผ่าน 31 tests; AC-ENR-04/05 navigation/status และรายละเอียดใบสมัครตรวจผ่าน |
| F-09 | Demo API บันทึก/โหลด Draft จาก localStorage ด้วย key แยกตาม applicant และลบ Draft เมื่อ Submit สำเร็จ | Tests สร้าง client ใหม่เพื่อจำลอง refresh, ตรวจแยก Draft ตาม applicant และยืนยันสถานะ Application; Frontend tests ผ่าน |
| F-10 | เพิ่ม UI test สำหรับเลือก year_level=`other`, แสดง field, required error ใต้ช่อง และ submit เมื่อกรอกรายละเอียด | `AC_ENR_03.test.jsx` ผ่าน; Frontend tests ทั้งชุด 31 tests ผ่าน |

ไม่มี F-ID ใหม่ในรอบนี้; F-02/F-06 คงเป็นประวัติและไม่ใช้แทน requirement หลัง CR-011-01. ไม่เชื่อม PostgreSQL/Login จริงและไม่เปลี่ยนสถานะ Task.

## 15. ผล /verify ปัจจุบัน 2026-11-09 09:39 UTC

ผลส่วนนี้ใช้แทนสถานะปัจจุบันในข้อ 14 โดยคงข้อ 1–14 ไว้เป็นประวัติ. ตรวจ spec Draft v4 (CR-011-01), plan, tasks, test-cases, RTM, AGENTS.md, source ทุกไฟล์ใน `backend/app/` และ `frontend/src/` และ tests ทุกไฟล์ใน `backend/tests/` และ `frontend/src/__tests__/`; ไม่พบ `specs/000-shared/` หรือ mockup HTML สำหรับ Feature 011.

รัน `cd backend && pytest -v`: 80 passed, 0 failed, 1 Starlette deprecation warning. รัน `cd frontend && npm test`: 12 test files passed, 51 passed, 0 failed. Backend tests ใช้ fake connection ไม่ใช่ PostgreSQL Integration; Demo Mode ทดสอบผ่าน Mock API โดยไม่เรียก Backend.

### ตามรอยไปข้างหน้า

สรุป 17 IDs: ครบ 9, ยังไม่ถึง 1, รอ Q-xx 0, ช่องโหว่ 7. F-03 และ F-05 ยังคงเปิด; F-08 แก้แล้วจากการทำให้ Backend กับ Demo validation ตรงกัน. ส่วน Staff Review ของ T-10 ยัง Deferred จึงนับส่วนที่ยังไม่ได้ทำเป็น “ยังไม่ถึง” ไม่ใช่ข้อค้นพบใหม่.

| ID | AC ที่อ้างโดยตรง | task | โค้ด | test และหลักฐาน | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `get_configured_camp`, `read_configured_camp`, `CampEnrollmentPage`, `DemoApp` | configured-camp API และ UI tests ตรวจค่ายเดียว/เปิดฟอร์มตรง; Demo bootstrap ยืนยันไม่มี Backend request (ผ่าน) | ครบ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `save_draft`, `get_draft`, `EnrollmentForm`, `createDemoApiClient` | tests ตรวจ partial Draft, owner scope, ไม่มีเอกสาร และ Demo reload/isolation; persistence กับ PostgreSQL จริงยังไม่ยืนยัน (F-03) และ identity จริงยังไม่ยืนยัน (F-05) | ช่องโหว่ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_enrollment_form`, `submit_application`, `CampEnrollmentPage`, `EnrollmentForm` | Backend ตรวจ 422/ทุก field errors, คง Draft และไม่สร้าง Application; UI ตรวจ error ใต้ช่องและแก้ไขต่อได้ (ผ่าน) | ครบ |
| FR-ENR-04 | AC-ENR-03 | T-07, T-08, T-16, T-17 | `validate_enrollment_form`, `EnrollmentForm`, `handleFieldChange` | Backend ตรวจปี 1–6/other/ค่าผิด; UI ตรวจช่อง other, required error และกรอกแล้วส่งได้ (ผ่าน) | ครบ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `handleFieldChange` | Backend และ Demo tests ตรวจ yes/no, String/non-String, omitted/null; UI ตรวจแสดง/ซ่อน/ล้างรายละเอียด และไม่มี file input (ผ่าน; F-08 แก้แล้ว) | ครบ |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `submit_application`, `handleSubmitApplication`, `EnrollmentPreview` | tests ตรวจ Submit สำเร็จ, `application_id`, `submitted`, form data, ไม่มีเอกสาร และ UI แสดงสถานะ (ผ่าน); transaction/SQL ยังไม่ได้ยืนยันกับ PostgreSQL จริง (F-03) | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09 ถึง T-13 | `submit_application`, `get_application`, `ApplicantApplicationPage` | Applicant GET/status/detail/navigation/refresh tests ผ่าน; DB จริงยังไม่ยืนยัน (F-03); Staff Review ยังไม่มี implementation เพราะ T-10 Deferred | ช่องโหว่ |
| NFR-USE-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/03 | T-07, T-09, T-14, T-15, T-17 | `getFieldErrors`, `EnrollmentForm` | UI tests ตรวจข้อความ error ใต้ช่องที่เกี่ยวข้องและ `aria-invalid`/`aria-describedby` สำหรับ validation (ผ่าน) | ครบ |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | Draft/Submission services, `ApplicantApplicationPage`, Demo localStorage | tests ตรวจข้อมูล/สถานะที่อ่านคืน, Demo refresh และแยก applicant; persistence จริงกับ PostgreSQL ยังไม่มี Integration Test (F-03) | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01/05 | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`, `get_draft`, `get_application` | owner/session tests ตรวจ 401 และ isolation ด้วย signed test cookie; ยังไม่มีหลักฐาน Login/authenticator ผูก identity จริง (F-05) | ช่องโหว่ |
| NFR-REL-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/03/04 | T-07–T-10, T-14–T-17 | `submit_application`, validators, `validateForm` | tests ตรวจ invalid submit คง Draft/ไม่สร้าง Application และ valid submit เป็น `submitted`; การยืนยันรายการ Staff Review ยังรอ T-10 Deferred | ยังไม่ถึง |
| CON-ENR-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01/04 | T-04, T-09 | `get_configured_camp_id`, `get_configured_camp`, `submit_application` | tests ตรวจ CAMP_ID, no-fallback, missing record และค่ายปิดก่อน submit (ผ่าน) | ครบ |
| CON-ENR-02 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01 | T-02, T-05, T-06, T-12 | `get_current_user_id`, Draft/Application API | tests ตรวจ signed Session, 401, owner scoping และไม่รับ owner จาก request; ไม่มี integration จาก Login จริง (F-05) | ช่องโหว่ |
| CON-ENR-03 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/04 | T-07, T-09, T-14 | `validate_enrollment_form`, `save_draft` | tests ตรวจ required fields ก่อนส่งและอนุญาต partial Draft (ผ่าน) | ครบ |
| CON-ENR-04 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-03/04 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `handleFieldChange` | Backend/Demo/UI tests ตรวจ year/allergy conditions, ล้างรายละเอียดเมื่อเลือก no และไม่มีเอกสาร (ผ่าน; F-08 แก้แล้ว) | ครบ |
| IF-ENR-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/04 | T-07, T-09, T-14 | `submit_application` | tests ตรวจ validation ก่อนบันทึก, failure คง Draft และ fake transaction rollback; PostgreSQL transaction จริงยังไม่ยืนยัน (F-03) | ช่องโหว่ |
| IF-ENR-02 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-03/04 | T-08, T-09, T-16 | `validate_enrollment_form`, `validateForm`, `submit_application` | tests ตรวจ year/allergy rules และยืนยันว่าไม่มี document validation/การสร้างเอกสารใน Submit (ผ่าน; F-08 แก้แล้ว) | ครบ |

### ตามรอยย้อนกลับ

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `config.py: get_configured_camp_id`; `GET /enrollment/camp`; `get_configured_camp` | FR-ENR-01, CON-ENR-01 | ตรง | ใช้ CAMP_ID server-side, เลือก record เดียว และไม่มี fallback |
| `GET/PUT /applications/draft`; `get_draft`, `save_draft` | FR-ENR-02, CON-ENR-02/03, NFR-DATA-01, NFR-SEC-01, ASM-09 | ตรงบางส่วน | Owner-scoped partial JSON Draft; Backend ใช้ PostgreSQL จริงตาม connection helper แต่ tests ใช้ fake; Demo ใช้ localStorage แยก key ตาม applicant |
| `POST /applications/submit`; `submit_application`, `validate_enrollment_form` | FR-ENR-03–07, CON-ENR-01/03/04, IF-ENR-01/02, NFR-REL-01 | ตรงบางส่วน | ตรวจค่าย/validation แล้วสร้าง `submitted`; F-03 ยังไม่ยืนยัน SQL/transaction กับ PostgreSQL จริง; ส่วนรายการ Staff Review ยังไม่ถึง T-10 |
| `GET /applications/{application_id}`; `get_application` | FR-ENR-07, NFR-DATA-01, NFR-SEC-01 | ตรงบางส่วน | จำกัด query ด้วย owner/CAMP_ID/application ID; tests ใช้ fake connection (F-03) |
| `GET /applications/review` | FR-ENR-07, NFR-REL-01 | ยังไม่ถึง | ไม่พบ endpoint/หน้า Staff Review; T-10 ระบุ Deferred |
| `get_current_user_id`, `bind_session_user`, `create_app` | CON-ENR-02, NFR-SEC-01 | ตรงบางส่วน | Session signature/401 ทำงาน แต่ไม่พบ Login/authenticator ที่เรียก bind identity ใน source; F-05 |
| `EnrollmentForm`, `EnrollmentPreview`, `CampEnrollmentPage` | FR-ENR-01–06, NFR-USE-01 | ตรง | ฟอร์มเฉพาะฟิลด์อนุมัติ, conditional fields, Draft, preview, field errors; ไม่พบ File Upload |
| `EnrollmentFlow`, `ApplicantApplicationPage`, `createApiClient` | FR-ENR-07, NFR-DATA-01 | ตรง | ใช้ `application_id` จาก Submit, แสดงข้อมูลที่อ่านคืน และ restore จาก URL/refresh; success layout ใช้เมื่อ status เป็น `submitted` |
| `createDemoApiClient`, `DemoApp`, Vite proxy config | FR-ENR-01–07, ASM-08/09 | ตรง | Demo ถูก gate ด้วย Vite Development flag, Mock API ใช้ localStorage และไม่มี fetch ไป Backend; allergy validation ตรงกับ Backend (F-08 แก้แล้ว) |
| Models และ `backend/db/schema.sql` | FR-ENR-02/07, NFR-DATA-01, ASM-08/09 | ตรงตามขอบเขตที่อนุมัติ | คง ApplicationDocument/legacy fields; ไม่มีเอกสารใน active flow. สถานะ `reviewed`/`rejected` คงตามมติ F-02 และไม่มี workflow เปลี่ยนสถานะ |

### ข้อค้นพบปัจจุบัน

F-03 และ F-05 ยังคงเปิด โดยคงข้อความ “ทีมตัดสิน” เดิมทุกตัวอักษร. F-01 ในประวัติข้อ 14 ไม่ยกเป็นข้อค้นพบปัจจุบัน เนื่องจาก Staff Review ยังไม่ทำและ T-10 เป็น Deferred; requirement ส่วนนี้แสดงเป็น “ยังไม่ถึง”. F-08 และ F-11 ย้ายเป็นแก้แล้วตามหลักฐานในตารางด้านล่าง.

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-03 | test อ่อน | Backend persistence/submit tests | AC-ENR-01, AC-ENR-04, FR-ENR-02, FR-ENR-06, FR-ENR-07, NFR-DATA-01, IF-ENR-01 | Backend tests ทั้งชุดใช้ fake connection เป็นหลัก; ยังไม่มีหลักฐานยืนยัน Draft/Application persistence, SQL/schema และ transaction กับ PostgreSQL จริง | คงสถานะเปิดไว้เพื่อรอ Integration Test กับ PostgreSQL จริง; ห้ามระบุว่าผ่านแล้ว |
| F-05 | test อ่อน | Session identity / Login integration | CON-ENR-02, NFR-SEC-01 | ตรวจ signed Session/owner ได้ แต่ไม่มีหลักฐานว่า Login ที่เชื่อถือได้เป็นผู้ผูก `user_id` ใน Session | |

### แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-08 | ปรับ Backend และ Demo validation ให้ `food_allergy_details` รับ String ที่ไม่ว่างเมื่อเลือก yes; เมื่อเลือก no ยอมรับการไม่ส่ง field หรือ String ว่าง/มีแต่ช่องว่าง และปฏิเสธค่าผิดประเภท/ข้อความที่ไม่ว่าง | Backend regression tests ครอบคลุม Array, Object, Number, Boolean, Null และ blank/non-blank String ทั้ง yes/no; `demoClient.test.js` ตรวจ error contract กรณีเดียวกัน; Backend 80 tests และ Frontend 51 tests ผ่าน |
| F-11 | แก้ข้อความเกริ่นใน `test-cases.md` ให้ระบุว่าเป็น Test Cases ฉบับปัจจุบันที่ได้รับอนุมัติสำหรับ CR-011-01 ตามมติทีม โดยไม่สร้างไฟล์ก่อน CR กลับมา | Diff ของ `test-cases.md` เปลี่ยนเฉพาะข้อความเกริ่น และค้นไฟล์ดังกล่าวแล้วไม่พบการอ้าง `test-cases-pre-cr.md`; ทีมยืนยันว่าไม่จำเป็นต้องเก็บฉบับก่อน CR |

F-02, F-06, F-07, F-09 และ F-10 ยังคงเป็นประวัติการแก้ไข/มติเดิมตามข้อก่อนหน้า. ไม่มีข้อค้นพบใหม่; จำนวน 17 IDs คงเดิมที่ครบ 9, ยังไม่ถึง 1, รอ Q-xx 0, ช่องโหว่ 7. ไม่มีการเปลี่ยนสถานะ Task ในการ Verify ครั้งนี้.

## 16. ผล /verify ปัจจุบัน 2026-11-09

ผลส่วนนี้ใช้แทนสถานะปัจจุบันในข้อ 15 โดยคงข้อก่อนหน้าไว้เป็นประวัติ. ตรวจ Spec Draft v4 (CR-011-01), Plan, Tasks, Test Cases, RTM, AGENTS.md, Source ใน `backend/app/` และ `frontend/src/`, Tests ใน `backend/tests/` และ `frontend/src/__tests__/`, `backend/main.py`, Vite config และ schema. ไม่พบ `specs/000-shared/` หรือ mockup HTML สำหรับ Feature 011.

รัน `cd backend && pytest -v`: 80 passed, 0 failed, 1 Starlette deprecation warning. รัน `cd frontend && npm test`: 13 test files, 61 passed, 0 failed. คำสั่ง `npm test` จาก repository root ไม่พบ `package.json`; รันซ้ำจาก `frontend/` สำเร็จ. Backend tests ใช้ fake connection ไม่ใช่ PostgreSQL Integration; Demo Mode ทดสอบผ่าน Mock API โดยไม่เรียก Backend.

### ตามรอยไปข้างหน้า

สรุป 17 IDs: ครบ 9, ยังไม่ถึง 1, รอ Q-xx 0, ช่องโหว่ 7. T-10 มีสถานะ “พร้อมทำ” แต่ยังไม่เสร็จ; Production Staff Review จึงยังไม่ถึง. F-03 และ F-05 ยังคงเปิด. พบ F-12 และ F-13 จากพฤติกรรม Demo ที่ได้รับอนุมัติแยกจาก Spec แต่ยังไม่ trace กลับไปยัง Spec.

| ID | AC ที่อ้างโดยตรง | task | โค้ด | test และหลักฐาน | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `get_configured_camp`, `read_configured_camp`, `CampEnrollmentPage`, `DemoApp` | configured-camp API และ UI tests ตรวจค่ายเดียว/เปิดฟอร์มตรง; Demo bootstrap ยืนยันไม่มี Backend request (ผ่าน) | ครบ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `save_draft`, `get_draft`, `EnrollmentForm`, `createDemoApiClient` | tests ตรวจ partial Draft, owner scope, ไม่มีเอกสาร และ Demo reload/isolation; persistence กับ PostgreSQL จริงยังไม่ยืนยัน (F-03) และ identity จริงยังไม่ยืนยัน (F-05) | ช่องโหว่ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `validate_enrollment_form`, `submit_application`, `CampEnrollmentPage`, `EnrollmentForm` | Backend ตรวจ 422/ทุก field errors, คง Draft และไม่สร้าง Application; UI ตรวจ error ใต้ช่องและแก้ไขต่อได้ (ผ่าน) | ครบ |
| FR-ENR-04 | AC-ENR-03 | T-07, T-08, T-16, T-17 | `validate_enrollment_form`, `EnrollmentForm`, `handleFieldChange` | Backend ตรวจปี 1–6/other/ค่าผิด; UI ตรวจช่อง other, required error และกรอกแล้วส่งได้ (ผ่าน) | ครบ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `handleFieldChange` | Backend และ Demo tests ตรวจ yes/no, String/non-String, omitted/null; UI ตรวจแสดง/ซ่อน/ล้างรายละเอียด และไม่มี file input (ผ่าน; F-08 แก้แล้ว) | ครบ |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `submit_application`, `handleSubmitApplication`, `EnrollmentPreview` | tests ตรวจ Submit สำเร็จ, `application_id`, `submitted`, form data, ไม่มีเอกสาร และ UI แสดงสถานะ (ผ่าน); transaction/SQL ยังไม่ได้ยืนยันกับ PostgreSQL จริง (F-03) | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09 ถึง T-13 | `submit_application`, `get_application`, `ApplicantApplicationPage`, Demo review client/page | Production Applicant GET/status/detail/navigation/refresh tests ผ่าน; DB จริงยังไม่ยืนยัน (F-03); Demo submit ไม่คง `submitted` และ Demo review แสดงสถานะอื่นด้วย (F-12) | ช่องโหว่ |
| NFR-USE-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/03 | T-07, T-09, T-14, T-15, T-17 | `getFieldErrors`, `EnrollmentForm` | UI tests ตรวจข้อความ error ใต้ช่องที่เกี่ยวข้องและ `aria-invalid`/`aria-describedby` สำหรับ validation (ผ่าน) | ครบ |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | Draft/Submission services, `ApplicantApplicationPage`, Demo localStorage | tests ตรวจข้อมูล/สถานะที่อ่านคืน, Demo refresh และแยก applicant; persistence จริงกับ PostgreSQL ยังไม่มี Integration Test (F-03) | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01/05 | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`, `get_draft`, `get_application` | owner/session tests ตรวจ 401 และ isolation ด้วย signed test cookie; ยังไม่มีหลักฐาน Login/authenticator ผูก identity จริง (F-05) | ช่องโหว่ |
| NFR-REL-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/03/04 | T-07–T-10, T-14–T-17 | `submit_application`, validators, `validateForm`; production review ยังไม่ทำ | tests ตรวจ invalid submit คง Draft/ไม่สร้าง Application และ valid submit เป็น `submitted`; ส่วน Staff Review ของ T-10 ยังไม่เสร็จ | ยังไม่ถึง |
| CON-ENR-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01/04 | T-04, T-09 | `get_configured_camp_id`, `get_configured_camp`, `submit_application` | tests ตรวจ CAMP_ID, no-fallback, missing record และค่ายปิดก่อน submit (ผ่าน) | ครบ |
| CON-ENR-02 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-01 | T-02, T-05, T-06, T-12 | `get_current_user_id`, Draft/Application API | tests ตรวจ signed Session, 401, owner scoping และไม่รับ owner จาก request; ไม่มี integration จาก Login จริง (F-05) | ช่องโหว่ |
| CON-ENR-03 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/04 | T-07, T-09 | `validate_enrollment_form`, `submit_application` | tests ตรวจครบทุกฟิลด์ก่อน Submit และ partial Draft ผ่านได้ (ผ่าน) | ครบ |
| CON-ENR-04 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-03/04 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`, `validateForm`, `handleFieldChange` | Backend/Demo/UI tests ตรวจ year/allergy conditions, ล้างรายละเอียดเมื่อเลือก no และไม่มีเอกสาร (ผ่าน; F-08 แก้แล้ว) | ครบ |
| IF-ENR-01 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-02/04 | T-07, T-09, T-14 | `submit_application` | tests ตรวจ validation ก่อนบันทึก, failure คง Draft และ fake transaction rollback; PostgreSQL transaction จริงยังไม่ยืนยัน (F-03) | ช่องโหว่ |
| IF-ENR-02 | ไม่มี AC อ้างตรง; พฤติกรรมอยู่ใน AC-ENR-03/04 | T-08, T-09, T-16 | `validate_enrollment_form`, `validateForm`, `submit_application` | tests ตรวจ year/allergy rules และยืนยันว่าไม่มี document validation/การสร้างเอกสารใน Submit (ผ่าน; F-08 แก้แล้ว) | ครบ |

### ตามรอยย้อนกลับ

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `config.py: get_configured_camp_id`; `GET /enrollment/camp`; `get_configured_camp` | FR-ENR-01, CON-ENR-01 | ตรง | ใช้ CAMP_ID server-side, เลือก record เดียว และไม่มี fallback |
| `GET/PUT /applications/draft`; `get_draft`, `save_draft` | FR-ENR-02, CON-ENR-02/03, NFR-DATA-01, NFR-SEC-01 | ตรงบางส่วน | Owner-scoped partial JSON Draft; Backend ใช้ PostgreSQL จริงตาม connection helper แต่ tests ใช้ fake; Demo ใช้ localStorage แยก key ตาม applicant |
| `POST /applications/submit`; `submit_application`, `validate_enrollment_form` | FR-ENR-03–07, CON-ENR-01/03/04, IF-ENR-01/02, NFR-REL-01 | ตรงบางส่วน | Production ตรวจค่าย/validation แล้วสร้าง `submitted`; F-03 ยังไม่ยืนยัน SQL/transaction กับ PostgreSQL จริง |
| `GET /applications/{application_id}`; `get_application` | FR-ENR-07, NFR-DATA-01, NFR-SEC-01 | ตรงบางส่วน | จำกัด query ด้วย owner/CAMP_ID/application ID; tests ใช้ fake connection (F-03) |
| Production `GET /applications/review` | FR-ENR-07, NFR-REL-01 | ยังไม่ถึง | ไม่พบ endpoint/หน้า Staff Review ฝั่ง Production; T-10 มีสถานะพร้อมทำแต่ยังไม่เสร็จ |
| `createDemoApiClient.submitApplication`, `withdrawApplication`, `getReviewApplications`, `getReviewApplication`; Demo Applicant/Admin pages | FR-ENR-07 (Demo only) | ไม่ตรงกับ Spec | ใบสมัคร Demo ใหม่กลายเป็น `approved` หรือ `waitlisted`; รองรับ `withdrawn` และเลื่อนคิวอัตโนมัติ; Admin เห็นทุกสถานะ. การอนุมัติ/คัดเลือกอยู่ใน Out of scope ของ Spec (F-12); ฟังก์ชันนี้เป็น Demo-only ตามมติแยกและไม่เรียก Production API |
| `DEMO_APPLICATION_CAPACITY`, `sortWaitlistedApplications`, `recalculateWaitlistPositions` ใน `demoClient.js` | ไม่มี ID กำหนด Capacity | ไม่ตรงกับ Spec | Capacity 3 เป็นค่าคงที่และถูกใช้ตัดสิน approved/waitlisted; Spec ไม่กำหนด Capacity. เป็นค่าที่ทีมอนุมัติแยกสำหรับ Demo-only แต่ยัง trace กลับไป Spec ไม่ได้ (F-13) |
| `get_current_user_id`, `bind_session_user`, `create_app` | CON-ENR-02, NFR-SEC-01 | ตรงบางส่วน | Session signature/401 ทำงาน แต่ไม่พบ Login/authenticator ที่เรียก bind identity ใน source; F-05 |
| `EnrollmentForm`, `EnrollmentPreview`, `CampEnrollmentPage` | FR-ENR-01–06, NFR-USE-01 | ตรง | ฟอร์มเฉพาะฟิลด์อนุมัติ, conditional fields, Draft, preview, field errors; ไม่พบ File Upload |
| `EnrollmentFlow`, `ApplicantApplicationPage`, `createApiClient` | FR-ENR-07, NFR-DATA-01 | ตรงบางส่วน | Production แสดง “รอตรวจสอบ” เมื่อ status=`submitted`; Demo มีสถานะ/ปุ่มเพิ่มเติมตาม F-12 |
| Models และ `backend/db/schema.sql` | FR-ENR-02/07, NFR-DATA-01, ASM-08/09 | ตรงตามขอบเขตที่อนุมัติ | Production schema ยังคงสถานะ `submitted`/`reviewed`/`rejected`; ไม่เพิ่ม schema หรือ workflow สำหรับ Demo-only statuses |
| `DemoApp`, Vite proxy config | FR-ENR-01–07, ASM-08/09 | ตรงด้านการแยก Demo/Production | Demo route เปิดเฉพาะ Development + `VITE_DEMO_MODE=true`; ใช้ fixed mock identities/localStorage; production route ยังคงใช้ API client ปกติ |

### ข้อค้นพบปัจจุบัน

F-03 และ F-05 ยังคงเปิดและคงข้อความ “ทีมตัดสิน” เดิมทุกตัวอักษร. F-12/F-13 เป็นข้อค้นพบใหม่จากการตรวจ Demo enhancement เทียบกับ Spec; การอนุมัติแยกของทีมไม่ได้แก้ข้อความหรือขอบเขตใน Spec.

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-03 | test อ่อน | Backend persistence/submit tests | AC-ENR-01, AC-ENR-04, FR-ENR-02, FR-ENR-06, FR-ENR-07, NFR-DATA-01, IF-ENR-01 | Backend tests ทั้งชุดใช้ fake connection เป็นหลัก; ยังไม่มีหลักฐานยืนยัน Draft/Application persistence, SQL/schema และ transaction กับ PostgreSQL จริง | คงสถานะเปิดไว้เพื่อรอ Integration Test กับ PostgreSQL จริง; ห้ามระบุว่าผ่านแล้ว |
| F-05 | test อ่อน | Session identity / Login integration | CON-ENR-02, NFR-SEC-01 | ตรวจ signed Session/owner ได้ แต่ไม่มีหลักฐานว่า Login ที่เชื่อถือได้เป็นผู้ผูก `user_id` ใน Session | |
| F-12 | โค้ดไม่มี FR | Demo Submit, withdrawal, queue promotion และ Staff Review | FR-ENR-07; Out of scope | Demo เปลี่ยนผล Submit จาก `submitted` เป็น `approved`/`waitlisted`, รองรับ `withdrawn` และเลื่อนคิวอัตโนมัติ; Demo Admin แสดงสถานะเหล่านี้แทนรายการเฉพาะ `submitted`. การอนุมัติและคัดเลือกผู้เข้าร่วมอยู่ใน Out of scope ของ Spec. พฤติกรรมนี้ได้รับอนุมัติแยกให้ใช้ Demo เท่านั้น แต่ยังไม่สอดคล้องกับ Spec/AC ปัจจุบัน | |
| F-13 | ตัวเลขไม่ตรง spec | `frontend/src/api/demoClient.js: DEMO_APPLICATION_CAPACITY` | ไม่มีข้อกำหนด Capacity ใน Spec | กำหนด Capacity คงที่เป็น 3 เพื่อเลือก approved/waitlisted; ไม่มี Requirement/Constraint ที่ระบุจำนวนนี้. เป็นค่าที่ทีมอนุมัติแยกสำหรับ Demo เท่านั้น จึงไม่มีหลักฐาน traceability จาก Spec และไม่ใช่ Production capacity | |

### แก้แล้ว

ไม่มี F-ID ที่ย้ายเป็นแก้แล้วในรอบนี้; F-08 และ F-11 คงหลักฐานการแก้ไขเดิมตามข้อ 15. สรุป 17 IDs ยังคงครบ 9, ยังไม่ถึง 1, รอ Q-xx 0, ช่องโหว่ 7. ไม่แก้ Source, Tests, Spec, Plan หรือ Tasks และไม่เปลี่ยนสถานะ T-10.
