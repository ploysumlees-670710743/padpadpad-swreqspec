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

## 10. RTM ก่อนการตรวจรอบ 2569-11-13: CR-011-01 (spec Draft v4)

ตารางนี้และส่วนที่ 1–9 เป็นหลักฐานก่อนการตรวจรอบ 2569-11-13; ให้ใช้ผลตรวจล่าสุดในหัวข้อ 11 สำหรับสถานะปัจจุบัน.

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

## 11. RTM ผลตรวจล่าสุด: /verify 2569-11-13 (CR-011-01)

ผลทดสอบ: `cd backend && pytest -v` เก็บ test ไม่สำเร็จ (9 collection errors; ไม่มี test เริ่มทำงาน); tests enrollment ที่รันแยกผ่าน 60; Login tests ที่รันแยกผ่าน 9. `cd frontend && npm test`: ผ่าน 35, ไม่ผ่าน 13 (6 รายการเกี่ยวกับ Camp Enrollment); เมื่อรัน 3 ไฟล์ frontend ที่เกี่ยวข้องด้วย `VITE_ENROLLMENT_MOCK=false` ผ่าน 8. Frontend Build ไม่ได้รันในรอบนี้.

### 11.1 ตามรอยไปข้างหน้า (requirement ไป AC ไป task ไป โค้ด ไป test)
สรุป 17 IDs: ครบ 6, ยังไม่ถึง 1, รอ Q-xx 0, ช่องโหว่ 10

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-ENR-01 | AC-ENR-01 | T-04, T-06 | `camp_enrollment.py: read_configured_camp`; `camp_enrollment_service.py: get_configured_camp`; `App.jsx: EnrollmentFlow` | `test_configured_camp_api_AC_ENR_01` ผ่าน; `AC_ENR_01.test.jsx` ล้มเมื่อใช้ค่า env ปริยาย แต่ 2 tests ผ่านเมื่อ `VITE_ENROLLMENT_MOCK=false` (F-07) | ช่องโหว่ |
| FR-ENR-02 | AC-ENR-01 | T-05, T-06 | `enrollment_draft_service.py: save_draft, get_draft`; `EnrollmentForm`, `CampEnrollmentPage` | `test_draft_owner_save_load_AC_ENR_01` ผ่าน; `AC_ENR_01.test.jsx` 2 tests ผ่านเมื่อ `VITE_ENROLLMENT_MOCK=false` (F-07) | ช่องโหว่ |
| FR-ENR-03 | AC-ENR-02 | T-07, T-09, T-14, T-15 | `enrollment_validator.py: validate_enrollment_form`; `enrollment_submission_service.py: submit_application`; `EnrollmentForm` | `test_AC_ENR_02_required_values_are_validated_against_the_approved_form`, `test_submit_validation_failure_returns_errors_and_preserves_draft`, `AC_ENR_02.test.jsx` ผ่าน; ยังไม่มี Staff Review ยืนยันว่า Draft ไม่แสดง (F-01) | ช่องโหว่ |
| FR-ENR-04 | AC-ENR-03 | T-08 | `enrollment_validator.py`; `EnrollmentForm` | `test_other_year_level_requires_and_accepts_a_detail`, `test_invalid_year_level_is_rejected` ผ่าน; ไม่มี UI test ยืนยันการแสดง/แจ้ง error ของ `year_level_other` (F-08) | ช่องโหว่ |
| FR-ENR-05 | AC-ENR-03 | T-08, T-09, T-16, T-17 | `enrollment_validator.py`; `EnrollmentForm` | `test_AC_ENR_03_allergy_details_are_required_for_submit`, `test_AC_ENR_03_food_allergy_validation` ผ่าน; ตรวจเงื่อนไข, แสดง error, ล้างรายละเอียดเมื่อเลือก “ไม่มี” | ครบ |
| FR-ENR-06 | AC-ENR-04 | T-09, T-11 | `camp_enrollment.py: submit_application`; `enrollment_submission_service.py: submit_application`; `CampEnrollmentPage` | `test_AC_ENR_04_submit_success_sets_review_status` และ `test_AC_ENR_04_submit_ui` ผ่านโดยใช้ fake connection/mock client; ยังไม่มี PostgreSQL integration (F-03) | ช่องโหว่ |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | T-09 ถึง T-13 | `submit_application`, `get_application`; `ApplicantApplicationPage`; Staff Review API ยังไม่มี (T-10 Deferred) | tests AC-ENR-04/05 ฝั่ง backend ใช้ fake connection และ UI tests ผ่านด้วย mock; ไม่มี test/API Staff Review (F-01, F-03) | ช่องโหว่ |
| NFR-USE-01 | AC-ENR-02, AC-ENR-03 | T-07, T-15, T-17 | `EnrollmentForm`; `CampEnrollmentPage` | `AC_ENR_02.test.jsx`, `AC_ENR_03.test.jsx` ผ่านสำหรับ required fields และ allergy; ไม่มี UI test ของข้อผิดพลาด `year_level_other` (F-08) | ช่องโหว่ |
| NFR-DATA-01 | AC-ENR-05 | T-01, T-05, T-12, T-13 | Draft/Application models; `save_draft`, `get_draft`, `get_application`; `ApplicantApplicationPage` | `test_AC_ENR_05_saved_application_status_is_visible`, `test_AC_ENR_05_application_view` ผ่านด้วย fake DB/mock; ยังไม่ยืนยัน persistence กับ PostgreSQL จริง (F-03) | ช่องโหว่ |
| NFR-SEC-01 | AC-ENR-01, AC-ENR-05 | T-02, T-05, T-06, T-10, T-12, T-13 | `get_current_user_id`; Login API และ Session; owner-scoped Draft/Application APIs | Session/Login และ owner isolation tests ผ่าน; Staff Review ที่มี role access ยังไม่ทำเพราะ T-10 Deferred | ยังไม่ถึง |
| NFR-REL-01 | AC-ENR-02, AC-ENR-03, AC-ENR-04 | T-07 ถึง T-10, T-14 ถึง T-17 | `submit_application` ปฏิเสธ validation ที่ไม่ผ่าน; Staff Review API ยังไม่มี | tests ยืนยัน error และคง Draft/ไม่สร้าง Application ด้วย fake connection; ไม่มี test ยืนยัน Staff Review ไม่แสดง Draft และไม่มี PostgreSQL integration (F-01, F-03) | ช่องโหว่ |
| CON-ENR-01 | AC-ENR-01, AC-ENR-04 | T-04, T-09 | `get_configured_camp_id`; `read_configured_camp`; `submit_application` | `test_configured_camp_api_AC_ENR_01`, tests กรณีไม่มี config/record และค่ายปิด ผ่าน | ครบ |
| CON-ENR-02 | AC-ENR-01 | T-02, T-05, T-06, T-12 | `bind_session_user`, `get_current_user_id`; Draft/Application APIs | `test_enrollment_session_guard`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_LOG_01_login_success_by_role` และ Login tests รวม 9 passed | ครบ |
| CON-ENR-03 | AC-ENR-02 | T-07, T-09, T-14 | `validate_enrollment_form`; `submit_application`; `save_draft` | tests required fields/validation failure ผ่าน; Draft partial ยังอยู่และไม่สร้าง Application เมื่อ validation ไม่ผ่าน | ครบ |
| CON-ENR-04 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16, T-17 | `validate_enrollment_form`; `EnrollmentForm`; Submit API | backend tests ครอบคลุม year level/allergy; allergy UI test ผ่าน; ไม่มี UI test ของ `year_level_other` (F-08) | ช่องโหว่ |
| IF-ENR-01 | AC-ENR-02, AC-ENR-04 | T-07, T-09, T-14 | `validate_enrollment_form`; `submit_application` | tests ยืนยัน Submit ตรวจ required fields ก่อนสร้าง Application และคง Draft เมื่อไม่ผ่าน | ครบ |
| IF-ENR-02 | AC-ENR-03, AC-ENR-04 | T-08, T-09, T-16 | `validate_enrollment_form`; `EnrollmentForm`; `submit_application` | backend tests ตรวจ year level/allergy; AC-ENR-03 UI test ตรวจ allergy; ไม่มี flow เอกสารแนบ | ครบ |

### 11.2 ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/config.py: get_configured_camp_id` | CON-ENR-01 | ตรง | อ่าน `CAMP_ID` ฝั่ง Server และไม่มี fallback |
| `backend/app/api/camp_enrollment.py: GET /enrollment/camp`; `camp_enrollment_service.py: get_configured_camp` | FR-ENR-01, CON-ENR-01 | ตรง | คืนข้อมูลจาก record ที่ตั้งค่าไว้ |
| `backend/app/api/camp_enrollment.py: PUT/GET /applications/draft`; `enrollment_draft_service.py: save_draft, get_draft` | FR-ENR-02, CON-ENR-02, CON-ENR-03, NFR-SEC-01, ASM-09 | ตรง | ใช้ CAMP_ID จาก Server และ applicant จาก Session; บันทึก partial Draft โดยไม่ใช้ submission validation |
| `backend/app/api/camp_enrollment.py: POST /applications/submit`; `enrollment_submission_service.py: submit_application` | FR-ENR-03, FR-ENR-04, FR-ENR-05, FR-ENR-06, FR-ENR-07, CON-ENR-01, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-REL-01 | ตรงบางส่วน | เช็คค่ายเปิด, validate ฟิลด์/เงื่อนไข และสร้าง `submitted`; ใช้ fake connection จึงยังไม่ยืนยัน PostgreSQL จริง (F-03); Staff Review ยังไม่มี (F-01) |
| `backend/app/api/camp_enrollment.py: GET /applications/{application_id}`; `enrollment_submission_service.py: get_application` | FR-ENR-07, NFR-DATA-01, NFR-SEC-01, AC-ENR-05 | ตรง | จำกัดข้อมูลตาม application ID, owner จาก Session และ CAMP_ID จาก Server; tests ใช้ fake connection |
| `GET /applications/review` (ยังไม่มี endpoint; T-10 Deferred) | FR-ENR-03, FR-ENR-07, NFR-SEC-01, NFR-REL-01 | ยังตรวจไม่ได้ | ไม่มีรายการ Staff Review และไม่มี test ยืนยันว่าแสดงเฉพาะใบสมัคร `submitted` (F-01); งานรอข้อจำกัด Authentication/Role ตาม tasks.md |
| `backend/app/validators/enrollment_validator.py: validate_enrollment_form, validate_form_field_names` | FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02 | ตรงตามเงื่อนไข | ตรวจ Required Fields, `year_level` และเงื่อนไขแพ้อาหาร; ไม่ตรวจหรือรับเอกสารแนบ |
| `backend/app/models/application.py`, `application_draft.py`, `camp.py`; `backend/db/schema.sql` | FR-ENR-02, FR-ENR-06, FR-ENR-07, NFR-DATA-01, NFR-REL-01, ASM-05, ASM-08, ASM-09 | ตรงตามขอบเขต | รองรับ Draft/Application และคง schema เอกสารเดิมเป็น legacy; active flow ไม่ใช้เอกสาร |
| `backend/app/api/authentication.py: POST /login`; `authentication_service.py: authenticate_user`; `middleware/auth.py: bind_session_user, get_current_user_id` | CON-ENR-02, NFR-SEC-01 | ตรง | Login ตรวจ account/password แล้วผูก identity ที่ยืนยันแล้วเข้ากับ signed Session; Login route tests ผ่าน 9 รายการ (ยืนยันการปิด F-05) |
| `frontend/src/App.jsx: EnrollmentFlow, App` | FR-ENR-01, FR-ENR-02, FR-ENR-06, FR-ENR-07, ASM-08 | ตรงบางส่วน | ใช้ API client หรือเลือก mock ตาม `VITE_ENROLLMENT_MOCK`; ค่าใน `.env.local` ทำให้เลือก mock และไม่ใช้ client ที่ test ส่งให้ (F-07) |
| `frontend/src/api/mockEnrollmentClient.js: mockEnrollmentClient` | FR-ENR-02, FR-ENR-03, FR-ENR-06, FR-ENR-07, ASM-08 | ตรงบางส่วน | บันทึก Draft/Application ใน `localStorage`; `submitApplication` ไม่ validate ข้อมูล จึงเป็น mock behavior เท่านั้น ไม่ใช่หลักฐานการทำงานของ Backend |
| `frontend/src/pages/CampEnrollmentPage.jsx: CampEnrollmentPage, handleSubmitApplication`; `EnrollmentForm`; `EnrollmentPreview` | FR-ENR-01 ถึง FR-ENR-06, CON-ENR-02 ถึง CON-ENR-04, NFR-USE-01 | ตรงบางส่วน | ฟอร์มและเงื่อนไข allergy ตรง; มี UI สำหรับ `year_level_other` แต่ไม่มี UI test ยืนยันทุก Then ของ AC-ENR-03 (F-08) |
| `frontend/src/pages/ApplicantApplicationPage.jsx: ApplicantApplicationPage` | FR-ENR-07, NFR-DATA-01, NFR-SEC-01, AC-ENR-05 | ตรง | เรียกดูใบสมัครและสถานะผ่าน client; test ใช้ mock client |
| `frontend/src/api/client.js: createApiClient` | FR-ENR-01, FR-ENR-02, FR-ENR-03, FR-ENR-06, FR-ENR-07, CON-ENR-02 | ตรง | เรียก API พร้อม credentials; ไม่รับ `camp_id` จากผู้สมัคร |
| `frontend/src/api/demoClient.js: createDemoApiClient`; `App.jsx: DemoApp` | ASM-08 | ตรง | Demo ใช้ข้อมูลจำลองเฉพาะเมื่อเปิด `VITE_DEMO_MODE` ใน Development และไม่เรียก Backend |

### 11.3 ข้อค้นพบปัจจุบัน
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | test อ่อน | AC-ENR-02/04 / Staff Review | FR-ENR-03, FR-ENR-07, NFR-REL-01 | ยังไม่มี `GET /applications/review` และ test ยืนยันว่า Draft ไม่แสดงในรายการเจ้าหน้าที่; T-10 ยัง Deferred | คงข้อค้นพบไว้ รอตรวจสอบใน T-10; Draft ต้องไม่ปรากฏใน Staff Review |
| F-03 | test อ่อน | TC-ENR-04-3 / `backend/tests/test_AC_ENR_04.py` | AC-ENR-04, AC-ENR-05, FR-ENR-06, FR-ENR-07, NFR-DATA-01 | Tests ของการ submit/อ่านข้อมูลใช้ fake connection และจำลองผล SQL/transaction เอง; ยังไม่มีการตรวจการทำงานกับ PostgreSQL จริงตามที่ TC-ENR-04-3 ระบุ จึงยังยืนยันการทำงานของ SQL, schema และ transaction ในฐานข้อมูลจริงไม่ได้ | คงสถานะเปิดไว้เพื่อรอ Integration Test กับ PostgreSQL จริง; ห้ามระบุว่าผ่านแล้ว |
| F-07 | test อ่อน | `frontend/.env.local`; `frontend/src/App.jsx: App` | AC-ENR-01, FR-ENR-01, FR-ENR-02 | ค่า `VITE_ENROLLMENT_MOCK=true` ทำให้ `App` เลือก `mockEnrollmentClient` แทน client ที่ tests ส่งเข้าไป; การรัน frontend suite ตามปกติมี test เกี่ยวกับ Camp Enrollment ล้มเหลว 6 รายการ แต่ 8 tests ใน 3 ไฟล์ผ่านเมื่อกำหนด `VITE_ENROLLMENT_MOCK=false`; test suite จึงไม่แยก API-client path จาก mock mode โดยค่าเริ่มต้น | คงข้อค้นพบไว้ ต้องปรับการตั้งค่าให้ทดสอบ API-client path ได้อย่างถูกต้อง และรัน Frontend Test Suite ซ้ำ|
| F-08 | test อ่อน | AC-ENR-03 / `frontend/src/components/EnrollmentForm.jsx`; `frontend/src/__tests__/AC_ENR_03.test.jsx` | FR-ENR-04, NFR-USE-01, CON-ENR-04 | มี backend tests ตรวจ `year_level=other` และรายละเอียด แต่ไม่มี UI test ยืนยันว่าเลือก “อื่นๆ (ระบุ)” แล้วแสดงช่องรายละเอียด และแจ้ง error เมื่อว่างตาม Then ของ AC-ENR-03 |คงข้อค้นพบไว้ ต้องเพิ่ม UI Test ให้ครอบคลุมการแสดงช่องรายละเอียดและการแจ้ง Error ก่อนพิจารณาปิด Finding|

### 11.4 แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-05 | พบ Login API/service ที่ตรวจ credentials จากฐานข้อมูลและเรียก `bind_session_user` หลังยืนยันบัญชี; Session guard อ่าน identity จาก signed Session | `test_AC_LOG_01_login_success_by_role`, tests AC-LOG-02/03 และ `test_login_authentication_service.py` ผ่านรวม 9 tests; ยืนยันเส้นทาง Login ผูกบัญชีกับ Session ได้ ไม่ได้อาศัย test ที่สร้าง cookie เองเพียงอย่างเดียว |

หมายเหตุ: F-04 มีมติทีมอนุมัติข้อความ “กำลังส่งใบสมัคร…” ตามข้อค้นพบเดิม จึงไม่เปิดซ้ำ; F-02 และ F-06 อยู่ในรายการแก้แล้วก่อนหน้านี้.


