# Tasks: คัดเลือกตามลำดับโควต้า 150 คน

- Feature: คัดเลือกตามลำดับโควต้า 150 คน (Selection)
- Spec ID: SPEC-SEL-006
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-10-18

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 3 เฟส (เฟส 0, 1, 2 และ เฟสสุดท้ายรอคำตอบ)
- งานย่อย: 8 task, 1 task รอ Q-01
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (แสดงรายชื่อและตรวจโควต้าเพื่อเริ่มคัดเลือกได้จริง)

## เฟส 0: ฐานรากสำหรับกระบวนการคัดเลือก (พื้นฐานร่วมทุกเฟส)

### T-01 สร้าง schema ผู้สมัครและข้อมูลตัวอย่างสำหรับคัดเลือก
- รองรับ: CON-SEL-01, CON-SEL-02, CON-SEL-03, FR-SEL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02 และ T-05
- ไฟล์ที่แตะ: `backend/db/schema.sql`, `backend/app/models/applicant.py`, `backend/app/models/selection_batch.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: โครงสร้างข้อมูล Applicant/SelectionBatch พร้อมค่าพื้นฐานของ eligibility_status, registration_timestamp และ quota limit สามารถใช้โดย API คัดเลือกต่อไปได้
- สถานะ: เสร็จ รอทีมตรวจ

## เฟส 1: แสดงรายชื่อและตรวจโควต้าเพื่อเริ่มคัดเลือกได้จริง (AC-SEL-01, AC-SEL-02, AC-SEL-03)

### T-02 สร้าง API แสดงรายชื่อผู้สมัครที่ผ่านเงื่อนไขตามลำดับสมัคร
- รองรับ: FR-SEL-01, CON-SEL-02, CON-SEL-03, ASM-05, ASM-06
- ตรวจด้วย: AC-SEL-01, AC-SEL-05
- ไฟล์ที่แตะ: `backend/app/api/selection.py`, `backend/app/services/selection_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `GET /selection/applicants` คืนรายชื่อผู้สมัครที่ข้อมูลถูกต้องและผ่านตรวจสอบแล้ว เรียงตาม `registration_timestamp` จากก่อนมาหลัง และใช้ลำดับสำรองเมื่อ Timestamp ซ้ำ
- สถานะ: พร้อมทำ

### T-03 สร้าง API ตรวจโควต้าและสร้าง batch คัดเลือก
- รองรับ: FR-SEL-02, FR-SEL-03, FR-SEL-05, CON-SEL-01, ASM-07
- ตรวจด้วย: AC-SEL-02, AC-SEL-03, AC-SEL-05
- ไฟล์ที่แตะ: `backend/app/api/selection.py`, `backend/app/services/selection_service.py`, `backend/app/validators/quota_validator.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: API ตรวจจำนวนคัดเลือกไม่เกิน 150 คน และเมื่อ quota มากกว่าจำนวนผู้สมัครที่ผ่านเกณฑ์แต่ยังไม่เกิน 150 จะใช้จำนวนที่มีจริงตาม ASM-07 พร้อมคืน `batch_id` ให้ใช้งานต่อ
- สถานะ: พร้อมทำ

### T-04 สร้างหน้า Dashboard คัดเลือกและฟอร์มระบุจำนวนผู้เข้าร่วม
- รองรับ: FR-SEL-01, FR-SEL-02, FR-SEL-03, FR-SEL-05, CON-SEL-01, CON-SEL-02
- ตรวจด้วย: AC-SEL-01, AC-SEL-02, AC-SEL-03
- ไฟล์ที่แตะ: `frontend/src/pages/SelectionDashboardPage.jsx`, `frontend/src/components/SelectionTable.jsx`, `frontend/src/api/client.js`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: ผู้ใช้สามารถเปิดหน้า Dashboard ดูรายชื่อที่เรียงตามเวลาสมัคร กำหนด quota และเห็นข้อความแจ้งเตือนเมื่อ quota เกิน 150 หรือเมื่อมีน้อยกว่าจำนวนที่มีจริง
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_SEL_01_select_first_150_valid_applicants`, `test_AC_SEL_02_block_quota_over_150`, `test_AC_SEL_03_select_all_when_valid_applicants_below_150`
- เปิดระบบ: ตาม plan.md ใช้ FastAPI backend และ React frontend ที่เรียก `frontend/src/api/client.js`
- คนลองเองตาม AC-SEL-01:
  Given รายชื่อผู้สมัครที่กรอกข้อมูลถูกต้องและเรียงตามเวลาสมัครจากก่อนมาหลังเรียบร้อย พร้อมมีผู้สมัครมากกว่า 150 คน
  When คณะกรรมการตั้ง quota = 150 และกดคัดเลือก
  Then ระบบคัดเลือกผู้สมัครลำดับ 1-150 ให้ได้รับสิทธิ์และบันทึกผลสำเร็จ
- ยังขาด: ไม่มี

## เฟส 2: ประมวลผลและยืนยันผลคัดเลือก (AC-SEL-01, AC-SEL-04, AC-SEL-05, AC-SEL-06)

### T-05 สร้าง API ประมวลผลคัดเลือกตามลำดับผู้สมัครและตรวจความเร็ว
- รองรับ: FR-SEL-04, FR-SEL-05, FR-SEL-06, CON-SEL-01, CON-SEL-02, CON-SEL-03, NFR-PERF-01
- ตรวจด้วย: AC-SEL-01, AC-SEL-03, AC-SEL-04
- ไฟล์ที่แตะ: `backend/app/services/selection_service.py`, `backend/app/api/selection.py`, `backend/tests/test_selection_performance.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: API คัดเลือกผู้สมัครที่ข้อมูลถูกต้องตามลำดับ FCFS และเมื่อมีผู้สมัครที่กรอกข้อมูลถูกต้องน้อยกว่า 150 คน จะคัดเลือกตามจำนวนที่มีจริง โดยตอบสนอง p95 <= 2 วินาที สำหรับ 150 คน
- สถานะ: พร้อมทำ

### T-06 สร้าง API ยืนยันผลและบันทึก Audit Log ด้วย Database Transaction
- รองรับ: FR-SEL-06, FR-SEL-07, CON-SEL-04, ASM-09, NFR-REL-01, NFR-SEC-01
- ตรวจด้วย: AC-SEL-01, AC-SEL-05, AC-SEL-06
- ไฟล์ที่แตะ: `backend/app/api/selection.py`, `backend/app/services/selection_service.py`, `backend/app/models/selection_audit_log.py`, `backend/app/db/transaction.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การยืนยันผลการคัดเลือกใช้ Database Transaction ป้องกันสถานะครึ่งหนึ่ง และบันทึก Audit Log ครบทั้งผู้ดำเนินการ วัน/เวลา รายการที่ดำเนินการ และผลการดำเนินการ พร้อมการเข้ารหัส TLS 1.2+ สำหรับ endpoint คัดเลือก
- สถานะ: พร้อมทำ

### T-07 สร้างหน้าแสดงผลคัดเลือกและประวัติ Audit Log
- รองรับ: FR-SEL-06, FR-SEL-07, CON-SEL-04, ASM-09
- ตรวจด้วย: AC-SEL-01
- ไฟล์ที่แตะ: `frontend/src/pages/SelectionDashboardPage.jsx`, `frontend/src/components/SelectionResultCard.jsx`, `frontend/src/api/client.js`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: คณะกรรมการเห็นผลการคัดเลือกแบบสรุป รวมทั้งรายการผู้ผ่านการคัดเลือกและ Audit Log ที่ระบุผู้ทำการยืนยันและเวลาที่ยืนยัน
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_SEL_01_select_first_150_valid_applicants`, `test_AC_SEL_04_selection_p95_under_2_seconds`, `test_AC_SEL_05_tls_12_required_for_selection_flow`, `test_AC_SEL_06_transactional_selection_commit`
- เปิดระบบ: ตาม plan.md ใช้ FastAPI backend และ React frontend ที่เรียก `frontend/src/api/client.js`
- คนลองเองตาม AC-SEL-01:
  Given ระบบมีผู้สมัครที่ผ่านเกณฑ์ 200 คน และคณะกรรมการกำหนด quota = 150
  When ยืนยันผลการคัดเลือกจากหน้าจอ Dashboard
  Then ระบบบันทึกผลลำดับ 1-150 เป็นผู้ได้รับสิทธิ์ พร้อม Audit Log และไม่เกินโควต้า 150 คน
- ยังขาด: ไม่มี

## เฟสสุดท้าย: รอคำตอบเรื่องคิวสำรอง (Q-01)

### T-08 เตรียมแผนรองรับคิวสำรองเมื่อผู้ได้รับสิทธิ์สละสิทธิ์
- รองรับ: Q-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เนื่องจากยังต้องรอคำตอบจากคณะกรรมการ
- ไฟล์ที่แตะ: `backend/app/services/selection_service.py`, `backend/app/models/selection_result.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: โครงร่างการจัดการคิวสำรองและสถานะสละสิทธิ์ถูกวางไว้เพื่อรอคำตอบเปิดคำถาม Q-01
- สถานะ: รอ Q-01

### จุดตรวจเฟสสุดท้าย
- test ที่ต้องผ่านทั้งหมด: ไม่มี จนกว่าจะได้รับคำตอบ Q-01
- เปิดระบบ: รอคำตอบจากคณะกรรมการก่อนเริ่มพัฒนา feature ที่เกี่ยวกับคิวสำรอง
- คนลองเองตาม Q-01:
  Given ระบบพร้อมให้ผู้ได้สิทธิ์สละสิทธิ์หลังยืนยันแล้ว
  When คณะกรรมการตัดสินใจว่าจะใช้คิวสำรองหรือไม่
  Then ระบบจะทำตามแนวทางที่ได้รับคำตอบ และทุก task ที่เกี่ยวข้องจะถูกเปิดต่อ
- ยังขาด: รอคำตอบ Q-01

## ตารางตรวจความครบ

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-SEL-01 | T-02, T-03, T-04, T-05, T-06, T-07 |
| AC-SEL-02 | T-03, T-04 |
| AC-SEL-03 | T-03, T-05 |
| AC-SEL-04 | T-05 |
| AC-SEL-05 | T-02, T-03, T-06 |
| AC-SEL-06 | T-06 |

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-SEL-01 | T-01, T-03, T-05 |
| CON-SEL-02 | T-01, T-02, T-05 |
| CON-SEL-03 | T-01, T-02, T-05 |
| CON-SEL-04 | T-06, T-07 |

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-SEL-01 | AC-SEL-01 | เฟส 1 |
| FR-SEL-02 | AC-SEL-01 | เฟส 1 |
| FR-SEL-03 | AC-SEL-02 | เฟส 1 |
| FR-SEL-04 | AC-SEL-01 | เฟส 2 |
| FR-SEL-05 | AC-SEL-03 | เฟส 1 / 2 |
| FR-SEL-06 | AC-SEL-01 | เฟส 2 |
| FR-SEL-07 | AC-SEL-01 | เฟส 2 |

## สิ่งที่ยังไม่ทำ

- Q-01: หากผู้ได้รับสิทธิ์สละสิทธิ์ในภายหลัง ระบบต้องมีฟังก์ชันเรียกคิวสำรองหรือไม่? -> รอ T-08 จนกว่าจะได้รับคำตอบจากคณะกรรมการ
