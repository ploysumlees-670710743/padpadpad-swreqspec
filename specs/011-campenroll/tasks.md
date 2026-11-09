# Tasks: สมัครเข้าร่วมค่าย (Camp Enroll)

- Feature: สมัครเข้าร่วมค่าย (Camp Enroll)
- Spec ID: SPEC-ENR-011
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-11-08 (ปรับตาม CR-011-01)

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 6 เฟส (เฟส 0 ถึงเฟส 5)
- งานย่อย: 17 tasks, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (เข้าฟอร์มค่ายเดียวโดยตรง กรอกข้อมูลที่อนุมัติ บันทึก/โหลด Draft พร้อม preview)

ข้อกำหนดร่วมของทุก Task: Feature นี้ใช้ `CAMP_ID` จาก Environment Variable ฝั่ง Server เท่านั้น; ห้ามรับ `camp_id` จากผู้สมัครหรือ fallback ไปค่ายอื่น. ต้องเก็บข้อมูลและ record ของค่ายอื่นใน Database ไว้เดิม. ก่อนส่งใบสมัคร Backend ตรวจว่า record ของ `CAMP_ID` มีอยู่และเปิดรับสมัคร.

## เฟส 0: ฐานรากสำหรับสมัครเข้าร่วมค่าย

### T-01 สร้างโมเดลและตารางข้อมูลสมัครกับ Draft
- รองรับ: FR-ENR-02, FR-ENR-07, CON-ENR-02, NFR-DATA-01, ASM-05, ASM-08, ASM-09
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04, T-05, T-07, T-08
- ไฟล์ที่แตะ: `backend/app/models/camp.py`, `backend/app/models/application.py`, `backend/app/models/application_draft.py`, `backend/app/models/application_document.py`, `backend/db/schema.sql`, `backend/db/seed_campenroll.sql`, `backend/tests/test_enrollment_schema_foundation.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ (CR-011-01): ตารางรองรับค่ายและใบสมัคร, Draft หนึ่งรายการต่อผู้สมัครสำหรับค่ายที่กำหนด (ใช้ unique `(applicant_id, camp_id)` เดิม); คงตาราง/Model เอกสารเป็น legacy data แต่ไม่ใช้ใน active enrollment flow; schema/seed ไม่ลบหรือแก้ไข record ของค่ายอื่น
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 ตั้งค่า FastAPI และตรวจ session ผู้สมัคร
- รองรับ: CON-ENR-02, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04, T-05, T-07, T-08, T-09, T-10, T-12
- ไฟล์ที่แตะ: `backend/main.py`, `backend/app/db/database.py`, `backend/app/middleware/auth.py`, `backend/tests/test_enrollment_session_guard.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: FastAPI เปิดใช้ฐานข้อมูลได้ และ route สมัครสามารถระบุบัญชีจาก session โดยไม่รับตัวระบุเจ้าของจาก request พร้อมให้ `test_enrollment_session_guard` ผ่าน
- สถานะ: เสร็จ

### T-03 ตั้งค่า React (Vite) และ API client
- รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, ASM-08
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06, T-11, T-13, T-15, T-17
- ไฟล์ที่แตะ: `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/api/demoClient.js`, `frontend/src/__tests__/frontend_bootstrap.test.jsx`, `frontend/src/__tests__/demoClient.test.js`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ (CR-011-01): React (Vite) เปิดได้; API client เรียก API ได้และหน้าจอทดสอบแทน client ด้วย mock ได้; Demo Mode เปิดได้เฉพาะ Development, ใช้ Mock API และไม่มี request ไป Backend จริง; `test_frontend_bootstrap` และ `demoClient.test.js` ผ่าน
- สถานะ: เสร็จ รอทีมตรวจ

## เฟส 1: เข้าฟอร์มค่ายเดียวและบันทึก/โหลด Draft ก่อนยืนยัน (AC-ENR-01)

### T-04 สร้าง API/config สำหรับค่ายเดียวที่ระบบกำหนด
- รองรับ: FR-ENR-01, CON-ENR-01
- ตรวจด้วย: AC-ENR-01
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/api/camp_enrollment.py`, `backend/app/services/camp_enrollment_service.py`, `backend/tests/test_enrollment_configured_camp.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: Backend อ่าน `CAMP_ID` จาก Environment Variable; `GET /enrollment/camp` ที่ต้องมี Session คืนข้อมูลและข้อกำหนดของ record เดียวที่กำหนดเพื่อใช้เปิดฟอร์มโดยตรง; หากไม่มี Session ตอบ HTTP 401, หากไม่กำหนด CAMP_ID หรือไม่พบ record ต้องแจ้ง Configuration Error และไม่เลือกค่ายอื่น; ไม่ลบ/แก้ไข record เดิม; `test_configured_camp_api_AC_ENR_01` ผ่าน
- สถานะ: เสร็จ รอทีมตรวจ

### T-05 สร้าง API บันทึกและโหลด Draft
- รองรับ: FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09
- ตรวจด้วย: AC-ENR-01
- ไฟล์ที่แตะ: `backend/app/api/camp_enrollment.py`, `backend/app/services/enrollment_draft_service.py`, `backend/app/models/application_draft.py`, `backend/app/models/application_document.py`, `backend/tests/test_enrollment_draft.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02, T-04
- เสร็จเมื่อ (CR-011-01): `PUT /applications/draft` รับ JSON `{ "form_data": {...} }` และ `GET /applications/draft` ใช้ CAMP_ID จาก Server และ applicant จาก Session เท่านั้น ไม่รับ camp_id/applicant_id จากผู้สมัคร; Draft คืนได้เฉพาะเจ้าของ, ไม่มี Session ได้ HTTP 401, PUT เก็บข้อมูล partial โดยไม่เรียก submission validation, ไม่มี endpoint/การบันทึกเอกสาร, ปฏิเสธแก้หลังส่ง และ `test_draft_owner_save_load_AC_ENR_01` ผ่าน
- สถานะ: เสร็จ รอทีมตรวจ

### T-06 สร้างหน้าฟอร์มสมัครและ preview Draft
- รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, CON-ENR-02, NFR-SEC-01
- ตรวจด้วย: AC-ENR-01
- ไฟล์ที่แตะ: `frontend/src/App.jsx`, `frontend/src/pages/CampEnrollmentPage.jsx`, `frontend/src/components/EnrollmentForm.jsx`, `frontend/src/components/EnrollmentPreview.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_ENR_01.test.jsx`
- แบบหน้าจอ: ไม่มี (spec ไม่มี UI ID หรือ mockup)
- ต้องทำหลัง: T-03, T-04, T-05
- เสร็จเมื่อ (CR-011-01): ผู้สมัครเข้าสู่ฟอร์มค่ายเดียวได้โดยตรงโดยไม่มีรายการ/ขั้นเลือกค่าย; เห็นเฉพาะฟิลด์ที่อนุมัติ ไม่มี File Upload; บันทึก/โหลด Draft และเห็น preview ก่อนยืนยัน; เมื่อ API จัดการ Draft ตอบ 401 UI แจ้งให้เข้าสู่ระบบ; `test_AC_ENR_01_form_preview_before_submit` ผ่านด้วย mock client
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_enrollment_schema_foundation`, `test_enrollment_session_guard`, `test_frontend_bootstrap`, `test_configured_camp_api_AC_ENR_01`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev` จาก repository root ตาม [plan.md](./plan.md)
- คนลองเองตาม AC-ENR-01:
  Given ผู้สมัครเข้าสู่ระบบแล้วและมีค่ายตัวอย่างที่เปิดรับสมัคร
  When เข้าฟอร์มค่ายโดยตรง กรอกข้อมูลบางส่วน บันทึก Draft แล้วออกจากและกลับเข้าสู่ระบบด้วยบัญชีเดิม
  Then ระบบโหลดข้อมูล Draft ให้เจ้าของได้และแสดง preview ก่อนยืนยัน โดยบัญชีอื่นเข้า Draft นี้ไม่ได้และ Draft ยังไม่ถือเป็นใบสมัครที่ส่งแล้ว
- ยังขาด: ไม่มี

## เฟส 2: ส่งใบสมัครที่ข้อมูลครบถ้วนโดยไม่แนบเอกสาร (AC-ENR-04)

### T-07 สร้าง validation ข้อมูลฟอร์มก่อนส่ง
- รองรับ: FR-ENR-03, CON-ENR-03, IF-ENR-01, NFR-USE-01
- ตรวจด้วย: AC-ENR-03, AC-ENR-04
- ไฟล์ที่แตะ: `backend/app/validators/enrollment_validator.py`, `backend/app/services/enrollment_submission_service.py`, `backend/tests/test_enrollment_data_validation.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02, T-05
- เสร็จเมื่อ (CR-011-01): ตรวจฟิลด์ Required ตามรายการที่อนุมัติสำหรับ Feature 011 และคืน error รายฟิลด์เมื่อขาด; validation ถูกเรียกเฉพาะตอนยืนยันส่ง และ `test_enrollment_data_validation.py` ผ่าน
- สถานะ: เสร็จ รอทีมตรวจ

### T-08 สร้าง validation เงื่อนไขชั้นปีและข้อมูลแพ้อาหาร
- รองรับ: FR-ENR-04, FR-ENR-05, CON-ENR-04, IF-ENR-02, NFR-REL-01
- ตรวจด้วย: AC-ENR-03, AC-ENR-04
- ไฟล์ที่แตะ: `backend/app/validators/enrollment_validator.py`, `backend/app/services/enrollment_submission_service.py`, `backend/tests/test_enrollment_data_validation.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02, T-05
- เสร็จเมื่อ (CR-011-01): รับเฉพาะชั้นปี 1–6 หรือ `other` ที่มีรายละเอียด; รับ allergy เฉพาะ `no`/`yes`; เมื่อเป็น `yes` ต้องมีรายละเอียดและเมื่อเป็น `no` ต้องไม่มีรายละเอียด; ไม่ตรวจหรือบังคับเอกสารแนบ และ validation มี test ครบ
- สถานะ: เสร็จ รอทีมตรวจ

### T-09 สร้าง API ส่งใบสมัครจาก Draft
- รองรับ: FR-ENR-06, FR-ENR-07, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-REL-01
- ตรวจด้วย: AC-ENR-04
- ไฟล์ที่แตะ: `backend/app/api/camp_enrollment.py`, `backend/app/services/enrollment_submission_service.py`, `backend/tests/test_AC_ENR_04.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-07, T-08
- เสร็จเมื่อ (CR-011-01): `POST /applications/submit` ใช้ CAMP_ID จาก Server, ตรวจว่าค่ายมีอยู่และเปิดรับสมัครก่อนส่ง, ไม่รับ camp_id จาก request, ตรวจข้อมูลตาม CON-ENR-03/04 และสร้าง Application ใน transaction สถานะ `submitted` เมื่อผ่าน โดยไม่ต้องมีเอกสาร; validation failure ตอบ HTTP 422 และคง Draft
- สถานะ: เสร็จ รอทีมตรวจ

### T-10 สร้างรายการตรวจสอบเฉพาะใบสมัครที่ส่งแล้ว
- รองรับ: FR-ENR-07, NFR-SEC-01, NFR-REL-01
- ตรวจด้วย: AC-ENR-04
- ไฟล์ที่แตะ: `backend/app/api/application_review.py`, `backend/app/services/enrollment_submission_service.py`, `backend/tests/test_application_review_list.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-09
- เสร็จเมื่อ: `GET /applications/review` สำหรับเจ้าหน้าที่ที่มีสิทธิ์คืนเฉพาะ Application สถานะ `submitted` ของ CAMP_ID จาก Server และไม่คืน Draft/ใบสมัครค่ายอื่น โดย `test_staff_review_lists_submitted_only_AC_ENR_04` ผ่าน
- Blocker: แม้ทีมเลือก PostgreSQL เป็นแหล่งจัดเก็บและตรวจ Role ผ่านตาราง `camp_enrollment_staff` แต่ยังไม่มีกระบวนการ Login ที่ยืนยันตัวตนจริงและผูก `user_id` ที่เชื่อถือได้กับ Session; ต้องกำหนด Authentication และ Migration/กระบวนการดูแล Role ก่อนเริ่ม implement
- สถานะ: Deferred (เลื่อนทำชั่วคราว; ยังไม่เสร็จ)

### T-11 เพิ่มการยืนยันส่งในหน้าฟอร์ม
- รองรับ: FR-ENR-06, FR-ENR-07
- ตรวจด้วย: AC-ENR-04
- ไฟล์ที่แตะ: `frontend/src/pages/CampEnrollmentPage.jsx`, `frontend/src/components/EnrollmentPreview.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_ENR_04.test.jsx`
- แบบหน้าจอ: ไม่มี (spec ไม่มี UI ID หรือ mockup)
- ต้องทำหลัง: T-06, T-09
- เสร็จเมื่อ: ปุ่มยืนยันเรียก `POST /applications/submit` โดยไม่ส่ง camp_id หลังผู้สมัครตรวจ preview และเมื่อสำเร็จแสดงผลสถานะ “รอตรวจสอบ” โดย `test_AC_ENR_04_submit_ui` ผ่านด้วย mock client
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_enrollment_schema_foundation`, `test_enrollment_session_guard`, `test_frontend_bootstrap`, `test_configured_camp_api_AC_ENR_01`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_enrollment_data_validation`, `test_AC_ENR_03_allergy_details_are_required_for_submit`, `test_AC_ENR_04_submit_success_sets_review_status`, `test_staff_review_lists_submitted_only_AC_ENR_04`, `test_AC_ENR_04_submit_ui`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev` จาก repository root ตาม [plan.md](./plan.md)
- คนลองเองตาม AC-ENR-04:
  Given ผู้สมัครมี Draft ที่กรอกข้อมูลครบตามข้อกำหนด โดยไม่ต้องแนบเอกสาร
  When ตรวจ preview แล้วกดยืนยันส่ง
  Then ระบบตรวจสอบ ย้าย Draft เป็นใบสมัคร `submitted` ในรายการเจ้าหน้าที่ และแสดง “รอตรวจสอบ” แก่ผู้สมัคร
- ยังขาด: ไม่มี

## เฟส 3: เรียกดูใบสมัครที่ส่งแล้ว (AC-ENR-05)

### T-12 สร้าง API เรียกดูใบสมัครของเจ้าของ
- รองรับ: FR-ENR-07, NFR-DATA-01, NFR-SEC-01
- ตรวจด้วย: AC-ENR-05
- ไฟล์ที่แตะ: `backend/app/api/camp_enrollment.py`, `backend/app/services/enrollment_submission_service.py`, `backend/tests/test_AC_ENR_05.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-09
- เสร็จเมื่อ: `GET /applications/{applicationId}` คืนข้อมูล/สถานะของใบสมัครใน CAMP_ID ที่กำหนดให้เจ้าของที่เข้าสู่ระบบเท่านั้น และ `test_AC_ENR_05_saved_application_status_is_visible` ผ่าน
- สถานะ: เสร็จ รอทีมตรวจ

### T-13 สร้างหน้าดูข้อมูลและสถานะใบสมัคร
- รองรับ: FR-ENR-07, NFR-DATA-01, NFR-SEC-01
- ตรวจด้วย: AC-ENR-05
- ไฟล์ที่แตะ: `frontend/src/pages/ApplicantApplicationPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_ENR_05.test.jsx`
- แบบหน้าจอ: ไม่มี (spec ไม่มี UI ID หรือ mockup)
- ต้องทำหลัง: T-03, T-11, T-12
- เสร็จเมื่อ (CR-011-01): ผู้สมัครเรียกดูข้อมูลที่ส่งแล้ว โดยแสดง label/ค่าของฟิลด์ที่กำหนดเป็นภาษาไทยและเห็นสถานะ “รอตรวจสอบ” โดย `test_AC_ENR_05_application_view` ผ่านด้วย mock client
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_enrollment_schema_foundation`, `test_enrollment_session_guard`, `test_frontend_bootstrap`, `test_configured_camp_api_AC_ENR_01`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_enrollment_data_validation`, `test_AC_ENR_03_allergy_details_are_required_for_submit`, `test_AC_ENR_04_submit_success_sets_review_status`, `test_staff_review_lists_submitted_only_AC_ENR_04`, `test_AC_ENR_04_submit_ui`, `test_AC_ENR_05_saved_application_status_is_visible`, `test_AC_ENR_05_application_view`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev` จาก repository root ตาม [plan.md](./plan.md)
- คนลองเองตาม AC-ENR-05:
  Given ผู้สมัครส่งใบสมัครสำเร็จและเป็นเจ้าของใบสมัคร
  When เปิดหน้าข้อมูลใบสมัคร
  Then ระบบแสดงข้อมูลที่บันทึกไว้และสถานะ “รอตรวจสอบ”
- ยังขาด: ไม่มี

## เฟส 4: แจ้งและคง Draft เมื่อข้อมูลสมัครไม่ครบ (AC-ENR-02)

### T-14 ทดสอบการปฏิเสธข้อมูลฟอร์มที่ไม่ครบ
- รองรับ: FR-ENR-03, CON-ENR-03, IF-ENR-01, NFR-USE-01, NFR-REL-01
- ตรวจด้วย: AC-ENR-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_ENR_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-07, T-08, T-09
- เสร็จเมื่อ: `test_AC_ENR_02_incomplete_form_shows_error` ยืนยันว่าคำขอส่งที่ข้อมูลไม่ครบคืนรายการฟิลด์ผิดพลาด คง Draft เดิม และไม่มี Application ในรายการตรวจสอบ
- สถานะ: เสร็จ รอทีมตรวจ

### T-15 แสดงข้อผิดพลาดรายฟิลด์และเก็บ Draft ไว้
- รองรับ: FR-ENR-03, NFR-USE-01, NFR-REL-01
- ตรวจด้วย: AC-ENR-02
- ไฟล์ที่แตะ: `frontend/src/pages/CampEnrollmentPage.jsx`, `frontend/src/components/EnrollmentForm.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_ENR_02.test.jsx`
- แบบหน้าจอ: ไม่มี (spec ไม่มี UI ID หรือ mockup)
- ต้องทำหลัง: T-06, T-11, T-14
- เสร็จเมื่อ: หน้าจอระบุช่องข้อมูลที่ต้องแก้ ไม่แสดงว่าส่งสำเร็จ และยังโหลด Draft เดิมกลับมาแก้ได้ โดย `test_AC_ENR_02_form_error_ui` ผ่านด้วย mock client
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_enrollment_schema_foundation`, `test_enrollment_session_guard`, `test_frontend_bootstrap`, `test_configured_camp_api_AC_ENR_01`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_enrollment_data_validation`, `test_AC_ENR_03_allergy_details_are_required_for_submit`, `test_AC_ENR_04_submit_success_sets_review_status`, `test_staff_review_lists_submitted_only_AC_ENR_04`, `test_AC_ENR_04_submit_ui`, `test_AC_ENR_05_saved_application_status_is_visible`, `test_AC_ENR_05_application_view`, `test_AC_ENR_02_required_values_are_validated_against_the_approved_form`, `test_AC_ENR_02_form_error_ui`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev` จาก repository root ตาม [plan.md](./plan.md)
- คนลองเองตาม AC-ENR-02:
  Given ผู้สมัครมี Draft ที่เว้นข้อมูลบังคับไว้อย่างน้อยหนึ่งช่อง
  When กดยืนยันส่งใบสมัคร
  Then ระบบระบุช่องที่ต้องแก้ คงข้อมูลไว้เป็น Draft และไม่สร้างรายการให้เจ้าหน้าที่ตรวจสอบ
- ยังขาด: ไม่มี

## เฟส 5: ตรวจข้อมูลแพ้อาหารและรายละเอียดแบบมีเงื่อนไข (AC-ENR-03)

### T-16 ทดสอบการตรวจข้อมูลแพ้อาหารแบบมีเงื่อนไข
- รองรับ: FR-ENR-05, CON-ENR-04, IF-ENR-02, NFR-REL-01
- ตรวจด้วย: AC-ENR-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_ENR_03.py`, `backend/tests/test_enrollment_data_validation.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-08, T-09
- เสร็จเมื่อ (CR-011-01): tests ยืนยันว่าเลือก “ไม่มี” ผ่านโดยไม่มีรายละเอียด; เลือก “มี” แต่รายละเอียดว่างตอบ HTTP 422/field error และคง Draft; มีรายละเอียดแล้วผ่าน; ไม่มีการตรวจหรือบังคับแนบเอกสาร
- สถานะ: เสร็จ รอทีมตรวจ

### T-17 แสดงฟิลด์ข้อมูลแพ้อาหารแบบมีเงื่อนไข
- รองรับ: FR-ENR-05, CON-ENR-04, NFR-USE-01, NFR-REL-01
- ตรวจด้วย: AC-ENR-03
- ไฟล์ที่แตะ: `frontend/src/pages/CampEnrollmentPage.jsx`, `frontend/src/components/EnrollmentForm.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_ENR_03.test.jsx`
- แบบหน้าจอ: ไม่มี (spec ไม่มี UI ID หรือ mockup)
- ต้องทำหลัง: T-06, T-11, T-16
- เสร็จเมื่อ (CR-011-01): เมื่อเลือก “มี” แสดงรายละเอียดและ error ใต้ช่องเมื่อจำเป็น; เมื่อเปลี่ยนเป็น “ไม่มี” ซ่อน/ล้างรายละเอียดและไม่ส่งค่าเก่าผ่าน Draft/Submit; ไม่มี File Upload UI; `test_AC_ENR_03_food_allergy_validation` ผ่านด้วย mock client
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 5
- test ที่ต้องผ่านทั้งหมด: `test_enrollment_schema_foundation`, `test_enrollment_session_guard`, `test_frontend_bootstrap`, `test_configured_camp_api_AC_ENR_01`, `test_draft_owner_save_load_AC_ENR_01`, `test_AC_ENR_01_form_preview_before_submit`, `test_enrollment_data_validation`, `test_AC_ENR_03_allergy_details_are_required_for_submit`, `test_AC_ENR_04_submit_success_sets_review_status`, `test_staff_review_lists_submitted_only_AC_ENR_04`, `test_AC_ENR_04_submit_ui`, `test_AC_ENR_05_saved_application_status_is_visible`, `test_AC_ENR_05_application_view`, `test_AC_ENR_02_required_values_are_validated_against_the_approved_form`, `test_AC_ENR_02_form_error_ui`, `test_AC_ENR_03_food_allergy_validation`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev` จาก repository root ตาม [plan.md](./plan.md)
- คนลองเองตาม AC-ENR-03:
  Given ผู้สมัครเลือก “มี” ในข้อมูลการแพ้อาหารแต่ยังไม่กรอกรายละเอียด
  When กดยืนยันส่งใบสมัคร
  Then ระบบแสดงข้อผิดพลาดใต้ช่องรายละเอียด คง Draft และไม่สร้างใบสมัครที่ส่งแล้ว
- ยังขาด: ไม่มี

## ตารางตรวจความครบ

### 1) AC ID | task ที่ตรวจ AC นี้

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-ENR-01 | T-04, T-05, T-06 |
| AC-ENR-02 | T-14, T-15 |
| AC-ENR-03 | T-07, T-08, T-16, T-17 |
| AC-ENR-04 | T-07, T-08, T-09, T-10, T-11 |
| AC-ENR-05 | T-12, T-13 |

### 2) Constraint/Quality ID | task ที่ทำให้เป็นจริง

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-ENR-01 | T-04 |
| CON-ENR-02 | T-02, T-05, T-06, T-12 |
| CON-ENR-03 | T-07, T-09, T-14 |
| CON-ENR-04 | T-08, T-09, T-16, T-17 |
| IF-ENR-01 | T-07, T-09, T-14 |
| IF-ENR-02 | T-08, T-09, T-16 |
| NFR-USE-01 | T-07, T-09, T-14, T-15 |
| NFR-DATA-01 | T-01, T-05, T-12, T-13 |
| NFR-SEC-01 | T-02, T-05, T-06, T-10, T-12, T-13 |
| NFR-REL-01 | T-07, T-08, T-09, T-10, T-14, T-15, T-16, T-17 |

### 3) FR ID | AC ที่ตรวจ FR นี้ | เฟส

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-ENR-01 | AC-ENR-01 | เฟส 1 |
| FR-ENR-02 | AC-ENR-01 | เฟส 1 |
| FR-ENR-03 | AC-ENR-02 | เฟส 4 |
| FR-ENR-04 | AC-ENR-03 | เฟส 5 |
| FR-ENR-05 | AC-ENR-03 | เฟส 5 |
| FR-ENR-06 | AC-ENR-04 | เฟส 2 |
| FR-ENR-07 | AC-ENR-04, AC-ENR-05 | เฟส 2, เฟส 3 |

## สิ่งที่ยังไม่ทำ
- Open Questions ใน spec: ไม่มี; ไม่มี task ที่รอ Q-xx
- CR-011-01 ระบุว่าไม่ใช้เอกสารแนบ; schema/Model เดิมคงอยู่เพื่อรักษา legacy data และไม่มีการ Migration/Seed จริงตามคำขอ
- ไม่สร้าง workflow อนุมัติ/ปฏิเสธหรือแจ้งเตือนเมื่ออนุมัติ เพราะอยู่นอกขอบเขตของ spec; เฟสส่งใบสมัครทำเพียงให้รายการ `submitted` ปรากฏแก่เจ้าหน้าที่ตรวจสอบ

