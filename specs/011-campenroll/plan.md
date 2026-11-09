# แผนงานเทคนิค: สมัครเข้าร่วมค่าย (Camp Enroll)

## 1. สรุปแนวทาง
- ฟีเจอร์นี้รองรับค่ายเดียว; ผู้สมัครเข้าสู่ฟอร์มโดยตรง ไม่ต้องเลือกค่าย
- Backend อ่าน `CAMP_ID` จาก Environment Variable เป็นแหล่งกำหนดค่ายเพียงแหล่งเดียว ตรวจ record ใน Database และไม่ fallback ไปยังค่ายอื่น; ไม่ลบหรือแก้ไข record ของค่ายอื่น
- ผู้ใช้หลักคือ นักศึกษา; ระบบตรวจฟิลด์บังคับ ชั้นปี และข้อมูลแพ้อาหารก่อนสร้างใบสมัครที่ส่งแล้วตาม CON-ENR-03, CON-ENR-04, IF-ENR-01 และ IF-ENR-02 ส่วน PUT Draft ไม่ทำ submission validation
- `camp_id` คงอยู่ใน Database และ Application/Draft/Document เพื่อรักษาความสัมพันธ์เดิม; ทุก operation ของ Feature นี้ใช้ `camp_id` จาก Backend configuration ไม่รับจากผู้สมัคร
- ฟอร์มมีเฉพาะฟิลด์ที่ Change Request อนุมัติ: full_name, nickname, student_id, year_level, phone_number, contact_channel, food_allergy และฟิลด์รายละเอียดแบบมีเงื่อนไข; ไม่มีฟิลด์อัปโหลดเอกสาร
- Draft เป็นข้อมูลฟอร์ม JSON หนึ่งรายการต่อบัญชีผู้สมัครสำหรับค่ายที่กำหนด โดยไม่ผ่าน validation การส่ง ตาม ASM-09, CON-ENR-02 และ NFR-SEC-01; ใช้ unique `(applicant_id, camp_id)` เดิมโดยไม่สร้าง Database ใหม่หรือแก้/ลบข้อมูลเดิม
- ตรวจความครบถ้วนและเงื่อนไขข้อมูลเฉพาะเมื่อผู้สมัครยืนยันส่ง หากไม่ผ่านให้คง Draft ไว้ หากผ่านให้ย้ายข้อมูลเป็นใบสมัคร `submitted` ที่เจ้าหน้าที่ตรวจสอบได้ และแสดง “รอตรวจสอบ” แก่ผู้สมัคร ตาม AC-ENR-02 ถึง AC-ENR-05
- ตาราง/Model ApplicationDocument และข้อมูลเดิมคงไว้เพื่อรักษา legacy data เท่านั้น; ไม่มีการใช้ใน active enrollment flow, API, validation หรือ Mock API
- Demo Mode เปิดได้เฉพาะ Vite Development เมื่อ `VITE_DEMO_MODE=true`; ใช้ Mock API ที่มี contract เดียวกับ API จริง และไม่มี request ไป Backend ตาม ASM-08

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
| --- | --- | --- |
| React (Vite) สำหรับส่วนหน้า | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้แสดงฟอร์มของค่ายเดียวโดยตรงและหน้าแสดงสถานะใบสมัครของนักศึกษา |
| Python FastAPI สำหรับส่วนหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้ตรวจข้อมูลสมัครและบันทึกใบสมัคร |
| PostgreSQL | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บตารางค่าย ใบสมัคร และ Draft |
| PostgreSQL `BYTEA` สำหรับเนื้อหาไฟล์เดิม | ทีมเลือกเอง ไม่ได้มาจาก spec | Schema เดิมคงไว้เพื่อรักษาข้อมูล legacy; ไม่ใช้เก็บไฟล์จากฟอร์มสมัครปัจจุบัน |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR |
| --- | --- | --- |
| Camp | คง camp_id, name, status, open_date, close_date, required_fields_json, required_documents_json, created_at; Feature นี้ใช้เฉพาะ record ที่ตรงกับ CAMP_ID; API คืนฟิลด์จากรายการอนุมัติและ `required_documents: []` | FR-ENR-01, FR-ENR-02, CON-ENR-01, ASM-02 |
| Applicant | applicant_id, user_id, full_name, created_at | FR-ENR-02, CON-ENR-02, ASM-01 |
| Application | application_id, applicant_id, camp_id, status=`submitted`, submitted_at, created_at, updated_at; unique applicant_id + camp_id | FR-ENR-06, FR-ENR-07, ASM-04, ASM-05 |
| ApplicationDraft | draft_id, applicant_id, camp_id, form_data_json, last_saved_at; คง unique applicant_id + camp_id; เมื่อใช้ CAMP_ID เดียวจึงมีได้หนึ่ง Draft ต่อผู้สมัครสำหรับค่ายนี้; ไม่มีข้อมูลไฟล์ | FR-ENR-02, CON-ENR-02, ASM-09 |
| ApplicationDocument (legacy) | คงตาราง/Model เดิมและ records; active enrollment routes ไม่อ่าน/เขียน/ตรวจเอกสาร ยกเว้น detach FK legacy ก่อนลบ Draft เพื่อไม่ให้การ Submit ทำลายข้อมูลเดิม | ASM-08, NFR-DATA-01 |
| ValidationError | error_id, draft_id, field_name, error_message, created_at | FR-ENR-03, FR-ENR-04, FR-ENR-05, NFR-USE-01 |

Draft ผูกกับบัญชีและค่าย เจ้าของเท่านั้นที่อ่าน/แก้ไขได้; Draft อาจเก็บข้อมูลที่ยังไม่ครบ แต่ไม่อยู่ในตารางใบสมัครที่เจ้าหน้าที่ตรวจสอบ; เมื่อ Submit ผ่าน validation จึงสร้าง Application ที่ status=`submitted` ตาม NFR-REL-01. ApplicationDocument เป็น legacy schema ไม่ใช่ข้อมูลของ flow ปัจจุบัน.

## 4. API / หน้าจอ

- GET /enrollment/camp — คืนข้อมูลและข้อกำหนดของ record ที่ระบุด้วย CAMP_ID เพียงรายการเดียวเพื่อเปิดฟอร์มโดยตรง; ไม่แสดงรายการให้เลือกและต้องมี Session — รองรับ FR-ENR-01, CON-ENR-01, CON-ENR-02
- GET /applications/draft — โหลด JSON form data ของบัญชีจาก Session สำหรับ CAMP_ID; ปฏิเสธเมื่อไม่มี Session ด้วย HTTP 401 — รองรับ FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09
- PUT /applications/draft — upsert `{ "form_data": {...} }` ของผู้ใช้ปัจจุบันสำหรับ CAMP_ID; ยอมรับข้อมูลไม่ครบและไม่เรียก validation; ไม่รับ multipart/file fields; ปฏิเสธเมื่อไม่มี Session ด้วย HTTP 401 — รองรับ FR-ENR-02, CON-ENR-02, ASM-09
- POST /applications/submit — เรียกเมื่อผู้สมัครกดยืนยันเท่านั้น; Backend ตรวจว่า CAMP_ID ถูกกำหนดและ record มีอยู่จริง พร้อมตรวจสถานะเปิดรับสมัครก่อนส่ง; ตรวจฟิลด์บังคับ, year_level และเงื่อนไข food_allergy แล้วทำ transaction เปลี่ยน Draft เป็น Application status=`submitted`; เมื่อไม่ผ่านส่ง HTTP 422 field errors และคง Draft โดยไม่สร้าง Application; ไม่ต้องใช้เอกสาร — รองรับ FR-ENR-03 ถึง FR-ENR-07, CON-ENR-01, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-USE-01, NFR-REL-01
- GET /applications/{applicationId} — แสดงข้อมูลใบสมัครใน CAMP_ID ที่กำหนดแก่เจ้าของที่เข้าสู่ระบบเท่านั้น — รองรับ NFR-DATA-01, NFR-SEC-01, AC-ENR-05
- GET /applications/review — รายการสำหรับเจ้าหน้าที่ที่มีสิทธิ์; คืนเฉพาะ Application ของ CAMP_ID ที่กำหนดและ status=`submitted`; ไม่คืน Draft หรือ Application ของค่ายอื่น — รองรับ FR-ENR-07, NFR-SEC-01, NFR-REL-01

ทุก endpoint ของ Feature นี้ใช้ `camp_id` จาก Backend configuration เท่านั้น ไม่รับ camp_id/applicant_id จากผู้สมัครเพื่อเลือกข้อมูลหรือเจ้าของ; Draft/Application ใช้ applicant_id จาก Session และตรวจเจ้าของก่อนคืนข้อมูล. เมื่อ API ที่ต้องยืนยันตัวตนตอบ 401 UI แจ้งให้ผู้สมัครเข้าสู่ระบบ. หากไม่มี CAMP_ID หรือไม่พบ record ค่ายดังกล่าวให้คืน/แสดง Configuration Error โดยไม่เลือกค่ายอื่นอัตโนมัติ. ก่อนส่งต้องตรวจสถานะค่ายเป็น `open`; สำหรับใบสมัครที่ส่งแล้ว ห้ามผู้สมัครแก้ไข Draft/ข้อมูลนั้นตาม ASM-06

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
| --- | --- | --- |
| CON-ENR-01 | CAMP_ID จาก Environment Variable เป็นค่ายเดียวของ Feature; ตรวจ record จริงและ status=`open` ก่อน submit; ไม่ fallback และไม่แตะ record อื่น | ใช้แล้ว |
| CON-ENR-02 | เปิดฟอร์มค่ายเดียวโดยตรง; Draft GET/PUT และ submit ใช้ Session, owner check, HTTP 401 เมื่อไม่มี Session และ UI แจ้งให้ login | ใช้แล้ว |
| CON-ENR-03 | ตรวจฟิลด์หลักทั้ง 7 รายการครบถ้วนเฉพาะ POST /applications/submit; PUT Draft รับข้อมูลไม่ครบได้ | ใช้แล้ว |
| CON-ENR-04 | ตรวจ year_level, year_level_other, food_allergy และ food_allergy_details ตามค่าที่อนุมัติ; ไม่ใช้เอกสารแนบ | ใช้แล้ว |
| IF-ENR-01 | submit ตรวจข้อมูลก่อนสร้าง Application; เมื่อไม่ผ่านคง Draft และไม่บันทึก Application | ใช้แล้ว |
| IF-ENR-02 | submit ตรวจเงื่อนไขข้อมูลชั้นปี/แพ้อาหารก่อนบันทึก Application; ไม่รับเอกสารใน enrollment flow | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
| --- | --- | --- |
| AC-ENR-01 | test_AC_ENR_01_form_preview_before_submit | ตรวจเปิดฟอร์มค่ายเดียวโดยตรง, มีเฉพาะฟิลด์ที่กำหนด, ไม่มี file input, บันทึก/โหลด Draft และ preview ก่อน submit |
| AC-ENR-02 | test_AC_ENR_02_form_error_ui | Submit เมื่อ Required Field ขาดแล้วเห็น HTTP 422/field errors, Draft ยังคงอยู่และแก้ไขต่อได้ |
| AC-ENR-03 | test_AC_ENR_03_food_allergy_validation | ตรวจ year level 1–6/other, allergy no/yes, required details และการล้างรายละเอียดเมื่อเปลี่ยนเป็น no |
| AC-ENR-04 | test_AC_ENR_04_submit_success_sets_review_status | ยืนยันข้อมูลครบโดยไม่แนบเอกสารแล้วสร้าง Application status=`submitted` และผู้สมัครเห็น “รอตรวจสอบ” |
| AC-ENR-05 | test_AC_ENR_05_saved_application_status_is_visible | หลัง submit นักศึกษาที่เป็นเจ้าของดูข้อมูลที่บันทึกและเห็น “รอตรวจสอบ” ได้ |

## 7. ลำดับงาน

1. คง schema และ records เดิมรวม ApplicationDocument เพื่อรักษาข้อมูล legacy; Feature ใช้ CAMP_ID เดียวและ unique `(applicant_id, camp_id)` เดิมให้ได้หนึ่ง Draft ต่อผู้สมัครสำหรับค่ายนี้ — เกี่ยวข้องกับ FR-ENR-01, FR-ENR-02, FR-ENR-06, FR-ENR-07, CON-ENR-01, CON-ENR-02, ASM-05, ASM-08, ASM-09
2. อ่าน CAMP_ID จาก server configuration, ตรวจ record ว่ามีอยู่และไม่ fallback; แสดงข้อมูลค่ายเดียวเพื่อเปิดฟอร์มโดยตรง — เกี่ยวข้องกับ FR-ENR-01, CON-ENR-01, ASM-02
3. สร้าง GET/PUT Draft JSON โดยผูกกับบัญชีจาก Session และ CAMP_ID ภายใน; PUT เก็บ partial Draft โดยไม่ validate และไม่มี campId ใน request — เกี่ยวข้องกับ FR-ENR-02, CON-ENR-02, NFR-SEC-01, ASM-09
4. สร้างฟอร์มค่ายเดียวโดยตรง ไม่แสดงรายการหรือขั้นเลือกค่าย; แสดงเฉพาะฟิลด์อนุมัติ บันทึก/โหลด Draft และ preview ก่อน submit — เกี่ยวข้องกับ FR-ENR-01, FR-ENR-02, AC-ENR-01
5. เมื่อกดยืนยันเท่านั้น ให้ validate ฟิลด์บังคับ year level และเงื่อนไข food allergy; หากไม่ครบคง Draft และแจ้ง field errors — เกี่ยวข้องกับ FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, AC-ENR-02, AC-ENR-03
6. ก่อน submit ตรวจ CAMP_ID/record และสถานะเปิดรับสมัคร; เมื่อ validation ผ่าน ให้ transaction ย้าย Draft เป็น Application `submitted` และให้ staff review แสดงเฉพาะรายการ submitted ของ CAMP_ID — เกี่ยวข้องกับ FR-ENR-06, FR-ENR-07, CON-ENR-01, AC-ENR-04, NFR-REL-01
7. สร้างหน้าแสดงข้อมูลใบสมัครและสถานะ “รอตรวจสอบ” แก่เจ้าของ — เกี่ยวข้องกับ NFR-DATA-01, NFR-SEC-01, AC-ENR-05
8. ทดสอบความสอดคล้องกับทุก AC และตรวจ traceability กับ FR, NFR, CON, IF — เกี่ยวข้องกับ AC-ENR-01 ถึง AC-ENR-05

## 8. สิ่งที่ยังไม่ทำ
- Open Questions ใน spec ปัจจุบัน: ไม่มี
- ไม่สร้าง flow อนุมัติ/ปฏิเสธหรือแจ้งเตือนเมื่ออนุมัติ เพราะอยู่นอกขอบเขตการสมัครตาม Out of scope; staff review ในแผนนี้เป็นเพียงการแสดง Application ที่ส่งแล้ว
- Schema/Model/ข้อมูลเอกสารเดิมยังคงอยู่ตาม ASM-08 เพื่อรักษา legacy data; ไม่โหลด/เขียน/ตรวจเอกสารผ่าน Feature 011 ใน CR นี้

## 9. คำสั่งเปิดระบบสำหรับจุดตรวจ
- Backend: `python -m uvicorn backend.main:app --reload` (รันจาก repository root)
- Frontend: `npm --prefix frontend run dev`
- Demo Mode (ไม่ต้องเปิด Backend/PostgreSQL): `VITE_DEMO_MODE=true npm --prefix frontend run dev`; เปิด `http://localhost:5173/`
- คำสั่งเป็นแนวทางตามโครง FastAPI และ React (Vite) ที่ plan เลือก; ต้องมี entry point และ scripts ตามคำสั่งนี้เมื่อ implement
