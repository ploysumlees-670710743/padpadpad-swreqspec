# Tasks: จัดการสถานะการสมัคร

- Feature: จัดการสถานะการสมัคร (Manage Application Status)
- Spec ID: UC-14
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-10-19

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 5 เฟส (เฟส 1, 2, 3, 4 และรอคำตอบ)
- งานย่อย: 8 tasks, 1 task รอ Open Question
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (ตรวจสอบสถานะและรายละเอียดค่าย)

## เฟส 1: ตรวจสอบสถานะและรายละเอียดค่าย (AC-STA-01)

### T-01 สร้าง API และหน้าตรวจสอบสถานะใบสมัคร
- รองรับ: FR-STA-01, CON-SEC-01, NFR-PERF-01
- ตรวจด้วย: AC-STA-01
- ไฟล์ที่แตะ: `.gitignore`, `requirements.txt`, `backend/app/main.py`, `backend/app/models/application_status.py`, `backend/app/middleware/auth.py`, `backend/db/schema.sql`, `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/pages/ApplicationStatusPage.jsx`, `frontend/src/api/client.js`, `backend/tests/test_AC_STA_01.py`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: นักศึกษาที่เป็นเจ้าของใบสมัครเห็นสถานะและรายละเอียดค่ายที่ระบุใน AC-STA-01 ภายใน 1.5 วินาที และผู้ใช้รายอื่นถูกปฏิเสธโดยไม่เปิดเผยข้อมูล
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_STA_01_owner_sees_application_status_and_camp_details`, `test_AC_STA_01_non_owner_is_forbidden`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-STA-01:
  Given นักศึกษาเข้าสู่ระบบและมีข้อมูลใบสมัครที่ประกาศผลแล้ว
  When เปิดหน้ารายละเอียดการสมัคร
  Then เห็นสถานะปัจจุบันและชื่อค่าย วัน-เวลาจัดกิจกรรม สถานที่ และเอกสาร/ข้อปฏิบัติที่ถูกต้อง
- ยังขาด: ไม่มี

## เฟส 2: ยืนยันสิทธิ์สำเร็จ (AC-STA-02)

### T-02 บันทึกการยืนยันสิทธิ์และเวลา UTC
- รองรับ: FR-STA-02, FR-STA-03, CON-DATA-01
- ตรวจด้วย: AC-STA-02
- ไฟล์ที่แตะ: `backend/app/models/application_status.py`, `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `backend/tests/test_AC_STA_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: นักศึกษาที่อยู่ในช่วงเวลายืนยันสิทธิ์บันทึกสถานะและเวลา UTC (ISO 8601) พร้อม Event Audit Log ได้ โดยตรวจเทียบกับ deadline ที่บันทึกไว้
- สถานะ: พร้อมทำ

### T-03 เพิ่ม confirmation dialog และแสดงเวลาท้องถิ่น
- รองรับ: FR-STA-02, FR-STA-03, NFR-USE-01
- ตรวจด้วย: AC-STA-02
- ไฟล์ที่แตะ: `frontend/src/pages/ApplicationStatusPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/test_AC_STA_02.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ก่อนยืนยันมี dialog ชัดเจน และเวลาที่ยืนยันแสดงเป็น Asia/Bangkok หลัง API บันทึกค่า UTC
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_STA_01_owner_sees_application_status_and_camp_details`, `test_AC_STA_01_non_owner_is_forbidden`, `test_AC_STA_02_confirmation_records_utc_timestamp`, `test_AC_STA_02_confirm_dialog_and_local_time`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-STA-02:
  Given นักศึกษาผ่านการคัดเลือกและยังอยู่ในช่วงเวลาที่กำหนด
  When กดยืนยันสิทธิ์และยืนยันใน dialog
  Then สถานะและเวลา UTC ถูกบันทึก และหน้าจอแสดงเวลา Asia/Bangkok
- ยังขาด: การกำหนดช่วงเวลายืนยันสิทธิ์ตาม Q-01

## เฟส 3: สละสิทธิ์และรับผลยืนยัน (AC-STA-03)

### T-04 บันทึกการสละสิทธิ์และ Event Audit Log
- รองรับ: FR-STA-04, CON-DATA-01
- ตรวจด้วย: AC-STA-03
- ไฟล์ที่แตะ: `backend/app/models/application_status.py`, `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `backend/tests/test_AC_STA_03.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: เมื่อผู้สมัครยืนยันการสละสิทธิ์ ระบบบันทึกสถานะและ audit log ใน transaction เดียวกัน และปฏิเสธการแก้ไขสถานะซ้ำ
- สถานะ: พร้อมทำ

### T-05 เพิ่ม dialog, popup และอีเมลแจ้งสละสิทธิ์
- รองรับ: FR-STA-04, CON-DATA-01, NFR-USE-01
- ตรวจด้วย: AC-STA-03
- ไฟล์ที่แตะ: `backend/app/services/withdrawal_email.py`, `frontend/src/pages/ApplicationStatusPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/test_AC_STA_03.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: ผู้ใช้ยืนยันใน dialog แล้วเห็น popup ผลทันที และอีเมลสรุปการสละสิทธิ์ถูกส่งไปยังอีเมลของนักศึกษา
- สถานะ: พร้อมทำ

### T-06 ปิดกั้นการแก้ไขสถานะที่เป็นสถานะสุดท้าย
- รองรับ: FR-STA-03, FR-STA-04
- ตรวจด้วย: AC-STA-02, AC-STA-03
- ไฟล์ที่แตะ: `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `frontend/src/pages/ApplicationStatusPage.jsx`, `backend/tests/test_AC_STA_02.py`, `backend/tests/test_AC_STA_03.py`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-02, T-04
- เสร็จเมื่อ: เมื่อสถานะเป็นยืนยันสิทธิ์หรือสละสิทธิ์ ทั้ง UI และ API ปิดกั้นการแก้ไขต่อไปตาม ASM-05
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: test ทุกตัวจากเฟส 1-3 ได้แก่ `test_AC_STA_01_owner_sees_application_status_and_camp_details`, `test_AC_STA_01_non_owner_is_forbidden`, `test_AC_STA_02_confirmation_records_utc_timestamp`, `test_AC_STA_02_confirm_dialog_and_local_time`, `test_AC_STA_03_withdrawal_is_final_and_audited`, `test_AC_STA_03_confirm_dialog_popup_and_email`, `test_AC_STA_02_reject_final_status_update`, `test_AC_STA_03_reject_final_status_update`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-STA-03:
  Given นักศึกษามีสถานะผ่านการคัดเลือก
  When กดสละสิทธิ์และยืนยันในกล่องข้อความเตือน
  Then สถานะเปลี่ยนเป็นสละสิทธิ์ แก้ไขซ้ำไม่ได้ มี popup และส่งอีเมลสรุป
- ยังขาด: ไม่มี

## เฟส 4: หมดเวลายืนยันสิทธิ์ (AC-STA-04)

### T-07 สร้าง scheduled job เปลี่ยนสถานะเมื่อพ้น deadline
- รองรับ: FR-STA-05, CON-DATA-01
- ตรวจด้วย: AC-STA-04
- ไฟล์ที่แตะ: `backend/app/jobs/application_deadline.py`, `backend/app/services/application_status_service.py`, `backend/tests/test_AC_STA_04.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: งานตรวจสอบทำงานทุกชั่วโมงและเปลี่ยนใบสมัครที่พ้น deadline เป็นสละสิทธิ์พร้อมบันทึก audit log โดยไม่เปลี่ยนสถานะของรายการที่ยังไม่ถึงกำหนด
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: test ทุกตัวจากเฟส 1-4 ได้แก่ `test_AC_STA_01_owner_sees_application_status_and_camp_details`, `test_AC_STA_01_non_owner_is_forbidden`, `test_AC_STA_02_confirmation_records_utc_timestamp`, `test_AC_STA_02_confirm_dialog_and_local_time`, `test_AC_STA_03_withdrawal_is_final_and_audited`, `test_AC_STA_03_confirm_dialog_popup_and_email`, `test_AC_STA_02_reject_final_status_update`, `test_AC_STA_03_reject_final_status_update`, `test_AC_STA_04_deadline_job_withdraws_expired_applications`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-STA-04:
  Given นักศึกษาผ่านการคัดเลือกแต่ไม่ยืนยันสิทธิ์ภายในเวลาที่กำหนด
  When scheduled job ตรวจสอบหลังพ้น deadline
  Then สถานะเปลี่ยนเป็นสละสิทธิ์โดยอัตโนมัติ
- ยังขาด: จำนวนวันของ deadline ตาม Q-01

## เฟสสุดท้าย: รอคำตอบ

### T-08 กำหนด deadline ตามคำตอบคณะกรรมการ
- รองรับ: FR-STA-03, FR-STA-05
- ตรวจด้วย: AC-STA-02, AC-STA-04
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/services/application_status_service.py`, `backend/app/jobs/application_deadline.py`, `backend/tests/test_AC_STA_02.py`, `backend/tests/test_AC_STA_04.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-07
- เสร็จเมื่อ: จำนวนวันและจุดเริ่มนับ deadline ถูกตั้งค่าตามคำตอบคณะกรรมการ และทั้งการยืนยันสิทธิ์กับ scheduled job ใช้ค่าเดียวกัน
- สถานะ: รอ Q-01

## ตารางตรวจความครบ

### AC ID | task ที่ตรวจ AC นี้
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-STA-01 | T-01 |
| AC-STA-02 | T-02, T-03, T-06, T-08 |
| AC-STA-03 | T-04, T-05, T-06 |
| AC-STA-04 | T-07, T-08 |

### Constraint ID | task ที่ทำให้เป็นจริง
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-SEC-01 | T-01 |
| CON-DATA-01 | T-02, T-04, T-06 |

### FR ID | AC ที่ตรวจ FR นี้ | เฟส
| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-STA-01 | AC-STA-01 | 1 |
| FR-STA-02 | AC-STA-02, AC-STA-03 | 2, 3 |
| FR-STA-03 | AC-STA-02 | 2 |
| FR-STA-04 | AC-STA-03 | 3 |
| FR-STA-05 | AC-STA-04 | 4 |

## สิ่งที่ยังไม่ทำ
- Q-01: กำหนดเวลายืนยันสิทธิ์คือกี่วันหลังประกาศผล (ต้องถามคณะกรรมการจัดค่าย) — T-08 รอคำตอบ
