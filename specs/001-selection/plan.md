# แผนงาน: คัดเลือกตามลำดับโควต้า 150 คน

## 1. สรุปแนวทาง
1. ระบบจะเริ่มจากการแสดงรายชื่อผู้สมัครที่กรอกข้อมูลถูกต้องและผ่าน Precondition แล้วเรียงตาม Timestamp จากก่อนไปหลัง เพื่อให้คณะกรรมการเห็นลำดับคัดเลือกชัดเจน
2. คณะกรรมการจะระบุจำนวนผู้เข้าร่วมที่ต้องการ เช่น 150 คน หรือจำนวนที่น้อยกว่า 150 ตามจำนวนผู้สมัครที่มีจริง โดยระบบจะตรวจเงื่อนไขควอต้าก่อนอนุญาตให้กดคัดเลือก
3. กระบวนการคัดเลือกจะใช้ลำดับผู้สมัครที่ผ่านเงื่อนไขและเรียงตามเวลาสมัคร สร้างผลลัพธ์เป็นผู้ผ่าน/ไม่ผ่านตามจำนวนที่ต้องการในแต่ละรอบ
4. ระบบจะตรวจความถูกต้องของจำนวนที่ได้รับสิทธิ์ให้ไม่เกิน 150 คน และเมื่อยืนยันผลแล้วจะบันทึกสถานะและ Audit Log เพื่อให้เกิดความเป็นทางการและติดตามได้
5. การพัฒนาแบ่งเป็น 3 ส่วนหลักคือ UI สำหรับแสดงและยืนยันผล, backend สำหรับคัดเลือกตามลำดับและตรวจโควต้า, และ audit/logging เพื่อรองรับ CON-SEL-04 และ FR-SEL-07

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับหน้าแสดงรายชื่อผู้สมัครและหน้ายืนยันผลการคัดเลือก |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับ API คัดเลือก ตรวจจำนวน และบันทึกผล |
| PostgreSQL | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลผู้สมัคร การคัดเลือก และ Audit Log |
| TLS 1.2+ | NFR-SEC-01 | ใช้กับการสื่อสารระหว่าง client/server ตาม Quality Requirement |
| Database Transaction | NFR-REL-01 | ใช้ใน API ยืนยันผลคัดเลือกเพื่อป้องกันสถานะไม่สมบูรณ์ |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR/CON |
|---|---|---|
| Applicant | applicant_id, full_name, registration_timestamp, eligibility_status, selection_status, is_valid_data, created_at | รองรับ FR-SEL-01, FR-SEL-04, FR-SEL-05, FR-SEL-06, FR-SEL-07 และ CON-SEL-02, CON-SEL-03 |
| SelectionBatch | batch_id, requested_quota, actual_selected_count, max_quota, created_by, created_at, status | รองรับ FR-SEL-02, FR-SEL-03, FR-SEL-06, FR-SEL-07, CON-SEL-01 |
| SelectionResult | result_id, batch_id, applicant_id, decision, rank_order, decided_at | รองรับ FR-SEL-04, FR-SEL-06, FR-SEL-07 |
| SelectionAuditLog | log_id, batch_id, actor_id, action, action_time, details | รองรับ CON-SEL-04, FR-SEL-07 |

หมายเหตุ:
- ไม่เก็บข้อมูลที่เป็นข้อมูลรับรอง Precondition เช่น เอกสาร/ข้อมูลผู้สมัครที่ยังไม่ได้ตรวจสอบในโมเดลนี้ เนื่องจาก spec ระบุว่าเป็น Precondition และไม่ใช่ส่วนของกระบวนการคัดเลือก
- ไม่บันทึกข้อมูลซ้ำในฟิลด์ที่ซ้ำซ้อนกับ Timestamp และ status ของผู้สมัคร เช่น การจัดอันดับจะใช้ registration_timestamp เป็นข้อมูลต้นทางตาม CON-SEL-02 และ ASM-05

## 4. API / หน้าจอ

| ชื่อ | รายละเอียด | รองรับ |
|---|---|---|
| GET /selection/applicants | แสดงรายชื่อผู้สมัครที่ข้อมูลถูกต้องและเรียงตาม registration_timestamp | FR-SEL-01 |
| POST /selection/validate-quota | รับ request_quota จากคณะกรรมการและตรวจว่าไม่เกิน 150 และไม่เกินจำนวนผู้สมัครที่ถูกต้อง | FR-SEL-02, FR-SEL-03, FR-SEL-05, FR-SEL-06 |
| POST /selection/batches | สร้าง batch การคัดเลือกด้วย quota ที่ยืนยันแล้ว และคืน batch_id | FR-SEL-02, FR-SEL-06 |
| POST /selection/batches/{batch_id}/run | ดำเนินคัดเลือกตามลำดับผู้สมัครที่ข้อมูลถูกต้อง โดยใช้ Timestamp จากก่อนไปหลัง | FR-SEL-04, FR-SEL-05, FR-SEL-06 |
| POST /selection/batches/{batch_id}/confirm | ยืนยันผลการคัดเลือกและอัปเดตสถานะผู้สมัคร | FR-SEL-07, CON-SEL-04 |
| GET /selection/batches/{batch_id}/audit | ดู Audit Log ของการยืนยันผล | CON-SEL-04, FR-SEL-07 |
| หน้า Selection Dashboard | หน้าปัจจุบัน: รายชื่อผู้สมัคร, ปุ่มยืนยันจำนวน, สถานะการคัดเลือก, สรุปจำนวนผู้ผ่าน | FR-SEL-01, FR-SEL-02, FR-SEL-03, FR-SEL-06, FR-SEL-07 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-SEL-01 | SelectionBatch.max_quota, POST /selection/validate-quota, POST /selection/batches/run | ใช้แล้ว |
| CON-SEL-02 | GET /selection/applicants และ POST /selection/batches/{batch_id}/run ใช้ registration_timestamp เพื่อจัดลำดับ FCFS | ใช้แล้ว |
| CON-SEL-03 | Applicant.eligibility_status และ filter ใน GET /selection/applicants และ POST /selection/batches/{batch_id}/run | ใช้แล้ว |
| CON-SEL-04 | SelectionAuditLog และ POST /selection/batches/{batch_id}/confirm | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-SEL-01 | `test_AC_SEL_01_select_first_150_valid_applicants` | สร้างผู้สมัครที่กรอกข้อมูลถูกต้อง 200 คน โดยเรียงตาม Timestamp จากก่อนไปหลัง แล้วตั้ง quota 150 จากหน้ารายการคัดเลือก ระบบต้องเลือกผู้สมัคร 1-150 และบันทึก status เป็นผ่าน |
| AC-SEL-02 | `test_AC_SEL_02_block_quota_over_150` | ตั้ง quota = 151 แล้วกดคัดเลือก ระบบต้องปฏิเสธและแสดงข้อความเตือนก่อนบันทึกผล |
| AC-SEL-03 | `test_AC_SEL_03_select_all_when_valid_applicants_below_150` | สร้างผู้สมัครที่กรอกข้อมูลถูกต้อง 120 คน ตั้ง quota = 150 ระบบต้องคัดเลือก 120 คน และไม่เกินจำนวนที่มีจริง |
| AC-SEL-04 | `test_AC_SEL_04_selection_p95_under_2_seconds` | จำลอง 150 ผู้สมัครที่ข้อมูลถูกต้องและเรียงตาม Timestamp แล้วเรียก API การคัดเลือกและบันทึกผล ระบบต้องมี p95 <= 2 วินาที |
| AC-SEL-05 | `test_AC_SEL_05_tls_12_required_for_selection_flow` | ตรวจความปลอดภัยของ endpoint การคัดเลือกว่ามี TLS 1.2+ บังคับใช้งานและไม่เปิดให้ HTTP อันเดียว |
| AC-SEL-06 | `test_AC_SEL_06_transactional_selection_commit` | จำลองการยืนยันผลพร้อมอัปเดตสถานะผู้สมัคร ระบบต้องใช้ Database Transaction และหากเกิดข้อผิดพลาดจะไม่ให้สถานะแบบครึ่งหนึ่ง |

## 7. ลำดับงาน

1. สร้างฐานข้อมูลและ schema สำหรับ Applicant, SelectionBatch, SelectionResult, SelectionAuditLog ตามข้อ AC และ constraints ที่ใช้ใน plan (FR-SEL-01, FR-SEL-02, CON-SEL-01, CON-SEL-02, CON-SEL-04)
2. สร้าง API ดึงรายชื่อผู้สมัครที่กรอกข้อมูลถูกต้องและเรียงตาม Timestamp พร้อมใช้ลำดับสำรองเมื่อ Timestamp ซ้ำ เพื่อรองรับ FR-SEL-01 และ CON-SEL-02 / ASM-06
3. สร้าง API ตรวจ quota และแสดงข้อผิดพลาดเมื่อจำนวนเกิน 150 เพื่อรองรับ FR-SEL-02, FR-SEL-03 และ CON-SEL-01
4. สร้าง API ประมวลผลคัดเลือกตามลำดับผู้สมัครที่มีข้อมูลถูกต้อง เพื่อรองรับ FR-SEL-04 และ FR-SEL-05 / ASM-07
5. สร้าง API ยืนยันผลและบันทึก Audit Log เพื่อรองรับ FR-SEL-06, FR-SEL-07, CON-SEL-04 และ ASM-09
6. สร้าง UI สำหรับหน้าดูรายชื่อผู้สมัครและยืนยันคัดเลือก เพื่อรองรับ FR-SEL-01, FR-SEL-02, FR-SEL-03 และ FR-SEL-07
7. ทดสอบกับ AC-SEL-01 ถึง AC-SEL-06 และตรวจสอบประสิทธิภาพ p95 <= 2 วินาทีสำหรับ 150 คน (NFR-PERF-01)

## 8. สิ่งที่ยังไม่ทำ

- Q-01: หากผู้ได้รับสิทธิ์สละสิทธิ์ในภายหลัง ระบบต้องมีฟังก์ชันเรียกคิวสำรองหรือไม่? -> ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบจากคณะกรรมการ
- คำถามจาก clarify Q1, Q4, Q5, Q6, Q8 ได้รับคำตอบแล้วและถูกปรับลงใน ASM-06 ถึง ASM-09 และ AC-SEL-04 ถึง AC-SEL-06 แล้ว ดังนั้นไม่เหลือความกำกวมที่ต้องรอในประเด็นเหล่านี้อีก
