# Tasks: เช็คการเข้าร่วมค่ายด้วย GPS (GPS Attendance)

- Feature: เช็คการเข้าร่วมค่ายด้วย GPS (GPS Attendance)
- Spec ID: SPEC-ATT-013
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-11-08

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 7 เฟส (เฟส 0, 1, 2, 3, 4, 5, 6)
- งานย่อย: 10 task, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (เลือกวันที่และรอบเวลาเพื่อดูข้อมูลค่ายและเริ่มเช็คเข้าร่วม)

## เฟส 0: ฐานรากสำหรับระบบเช็คเข้าร่วม GPS

### T-01 สร้างตารางผู้เข้าร่วมและบันทึกเช็คเข้าร่วม
- รองรับ: CON-ATT-01, CON-ATT-03, CON-ATT-05, NFR-DATA-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-04, T-05, T-06
- ไฟล์ที่แตะ: `backend/app/models/participant.py`, `backend/app/models/camp_location.py`, `backend/app/models/attendance_record.py`, `backend/db/schema.sql`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ตารางและ unique constraint สำหรับ `participant_id + attendance_date + time_slot` พร้อมตัวอย่างข้อมูลผู้เข้าร่วมและสถานที่ค่ายใช้งานได้สำหรับ API ขั้นต่อไป
- สถานะ: พร้อมทำ

### T-02 สร้างฮูดหลังบ้านและข้อมูลตัวอย่างสำหรับลองระบบ
- รองรับ: CON-ATT-01, CON-ATT-07, CON-ATT-08, FR-ATT-13, FR-ATT-16
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 ถึง T-10
- ไฟล์ที่แตะ: `backend/app/main.py`, `backend/app/api/attendance.py`, `backend/app/api/committee.py`, `backend/app/services/attendance_service.py`, `backend/app/seeds/sample_data.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: backend เริ่มทำงานได้ พร้อม endpoint เบื้องต้นสำหรับดูรอบเวลา ดูสถานะ และข้อมูลตัวอย่างของผู้เข้าร่วม/คณะกรรมการสำหรับทดสอบในเฟสถัดไป
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: ไม่มี test เฟสนี้ แต่ทุก task ในเฟส 0 ต้องพร้อมสำหรับเฟส 1
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และเปิดหน้าจอ React ตาม plan.md
- คนลองเองตามฐานราก:
  Given มีข้อมูลผู้เข้าร่วมและสถานที่ค่ายในฐานข้อมูล
  When เริ่มระบบหลังบ้านและหน้าจอ
  Then API เรียกสำเร็จและข้อมูลตัวอย่างพร้อมใช้งานสำหรับการทดสอบต่อไป
- ยังขาด: ไม่มี

## เฟส 1: เลือกวันที่และรอบเวลา พร้อมดูข้อมูลค่าย (AC-ATT-01)

### T-03 สร้างหน้าเลือกวันที่/รอบเวลาและแสดงสถานที่ค่าย
- รองรับ: FR-ATT-01, FR-ATT-02, CON-ATT-03, NFR-USE-01
- ตรวจด้วย: AC-ATT-01
- ไฟล์ที่แตะ: `frontend/src/pages/AttendanceCheckinPage.jsx`, `frontend/src/components/AttendanceSlotSelector.jsx`, `frontend/src/api/client.js`, `backend/app/api/attendance.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: ผู้เข้าร่วมสามารถเลือกวันที่และรอบเวลา 3 รอบ (เช้า/กลางวัน/เย็น) ได้ และเห็นสถานที่ค่ายและรัศมีที่ใช้ตรวจสอบจากหน้าเช็คเข้าร่วม
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_01_show_selected_date_and_slot`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev` ใน frontend
- คนลองเองตาม AC-ATT-01:
  Given ผู้เข้าร่วมเป็นผู้มีสิทธิ์เข้าร่วมค่าย และเลือกวันที่ 2569-09-20
  When เลือกรอบเวลาเช้าแล้วกดถัดไปหรือยืนยันการเลือก
  Then ระบบต้องแสดงวันที่และรอบเวลาที่เลือก รวมถึงข้อมูลสถานที่ค่ายและรัศมีที่ใช้ตรวจสอบ
- ยังขาด: ไม่มี

## เฟส 2: ขอ GPS และบันทึกเช็คเข้าร่วมที่สำเร็จ (AC-ATT-02, AC-ATT-03)

### T-04 สร้างการขอสิทธิ์ GPS และเกตเวย์ก่อนเช็คเข้าร่วม
- รองรับ: FR-ATT-03, CON-ATT-02, CON-ATT-07, IF-ATT-01, NFR-REL-01, NFR-SEC-01
- ตรวจด้วย: AC-ATT-02, AC-ATT-06
- ไฟล์ที่แตะ: `frontend/src/pages/AttendanceCheckinPage.jsx`, `frontend/src/api/client.js`, `backend/app/services/attendance_service.py`, `backend/app/api/attendance.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: เมื่อกดเช็คเข้าร่วม ระบบยืนยันว่าผู้ใช้ยินยอมให้ GPS และส่งข้อมูลตำแหน่งให้ backend ก่อนอนุญาตดำเนินการ และในกรณี GPS ไม่พร้อมหรือไม่อนุญาตระบบปฏิเสธและแจ้งให้ลองใหม่
- สถานะ: พร้อมทำ

### T-05 สร้างฟังก์ชันคำนวณระยะทางและบันทึก AttendanceRecord ที่สำเร็จ
- รองรับ: FR-ATT-04, FR-ATT-05, FR-ATT-06, FR-ATT-08, FR-ATT-09, FR-ATT-10, CON-ATT-04, CON-ATT-06, NFR-DATA-01, NFR-DATA-03, NFR-REL-02
- ตรวจด้วย: AC-ATT-03
- ไฟล์ที่แตะ: `backend/app/services/attendance_service.py`, `backend/app/models/attendance_record.py`, `backend/app/utils/gps.py`, `backend/app/api/attendance.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: เมื่อ GPS อยู่ภายในรัศมี ระบบบันทึกสถานะ “เข้าร่วม” พร้อมวันที่ เวลา latitude longitude และระยะห่างจากสถานที่ค่าย และส่งผลกลับไปยังหน้าเช็คเข้าร่วมอย่างถูกต้อง
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_02_request_gps_before_checkin`, `test_AC_ATT_03_successful_checkin_records_attendance`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev`
- คนลองเองตาม AC-ATT-02 และ AC-ATT-03:
  Given ผู้เข้าร่วมเลือกวันและรอบเวลาแล้ว และ GPS พร้อมใช้งาน
  When กดเช็คเข้าร่วม แล้วให้ระบบเข้าถึงตำแหน่งและกดยืนยัน
  Then ระบบจะขอ GPS ก่อนดำเนินการ และหากอยู่ภายในรัศมี จะบันทึกสถานะ “เข้าร่วม” พร้อมข้อมูลวัน เวลา latitude longitude และระยะห่าง
- ยังขาด: ไม่มี

## เฟส 3: ปฏิเสธนอกพื้นที่และป้องกันการเช็คซ้ำ (AC-ATT-04, AC-ATT-05)

### T-06 สร้างเงื่อนไขปฏิเสธนอกพื้นที่และยึด record แรก
- รองรับ: FR-ATT-05, FR-ATT-07, FR-ATT-11, CON-ATT-04, CON-ATT-05, IF-ATT-02, IF-ATT-03, NFR-DATA-02, NFR-REL-02
- ตรวจด้วย: AC-ATT-04, AC-ATT-05
- ไฟล์ที่แตะ: `backend/app/services/attendance_service.py`, `backend/app/validators/attendance_validator.py`, `backend/db/schema.sql`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: ถ้าตำแหน่งอยู่นอกรัศมี ระบบไม่บันทึกสถานะ “เข้าร่วม” และไม่เก็บการพยายามเช็ค และถ้าพยายามเช็คซ้ำในวัน/รอบเดียวกัน ระบบยึด record แรกและไม่สร้างข้อมูลซ้ำ
- สถานะ: พร้อมทำ

### T-07 สร้างการแจ้งผล GPS ไม่พร้อมและปฏิเสธเช็คเมื่อยืนยันไม่ได้
- รองรับ: FR-ATT-03, FR-ATT-06, FR-ATT-07, IF-ATT-01, NFR-REL-01
- ตรวจด้วย: AC-ATT-06
- ไฟล์ที่แตะ: `frontend/src/pages/AttendanceCheckinPage.jsx`, `frontend/src/api/client.js`, `backend/app/api/attendance.py`, `backend/app/services/attendance_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: กรณี GPS ไม่พร้อม ผู้ใช้ไม่อนุญาต หรือยืนยันตำแหน่งไม่ได้ หน้าเช็คเข้าร่วมแสดงข้อความ “ลองใหม่” และ backend ไม่บันทึกข้อมูลการเข้าร่วม
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_04_out_of_range_checkin_is_rejected`, `test_AC_ATT_05_duplicate_checkin_keeps_first_record`, `test_AC_ATT_06_unavailable_gps_is_rejected`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev`
- คนลองเองตาม AC-ATT-04 / AC-ATT-05 / AC-ATT-06:
  Given ผู้เข้าร่วมมีข้อมูลผู้ใช้อยู่ในระบบ และเลือกวันที่/รอบเวลาเดียวกันซ้ำ
  When พยายามเช็คจากตำแหน่งนอกพื้นที่ หรือ GPS ไม่พร้อม หรือเช็คซ้ำ
  Then ระบบต้องไม่บันทึกสถานะ “เข้าร่วม” และแจ้งเหตุผลให้ทราบ พร้อมคงสถานะเป็น “ยังไม่เช็ค” สำหรับกรณีนอกพื้นที่
- ยังขาด: ไม่มี

## เฟส 4: ประวัติการเข้าร่วมของผู้เข้าร่วม (AC-ATT-07)

### T-08 สร้างหน้าประวัติการเข้าร่วมเฉพาะบัญชีของผู้ใช้
- รองรับ: FR-ATT-12, CON-ATT-07, NFR-SEC-01, NFR-DATA-03
- ตรวจด้วย: AC-ATT-07
- ไฟล์ที่แตะ: `frontend/src/pages/ParticipantHistoryPage.jsx`, `frontend/src/api/client.js`, `backend/app/api/attendance.py`, `backend/app/services/attendance_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: ผู้เข้าร่วมเปิดประวัติการเข้าร่วมแล้วเห็นเฉพาะการเช็คที่สำเร็จและมีสถานะ “เข้าร่วม” เท่านั้น โดยไม่รวมการพยายามเช็คที่ไม่ผ่าน
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_07_participant_history_shows_only_successful_records`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev`
- คนลองเองตาม AC-ATT-07:
  Given ผู้เข้าร่วมมีประวัติการเช็คเข้าร่วมที่สำเร็จและเคยมีการเช็คที่ไม่ผ่าน
  When เปิดประวัติการเข้าร่วม
  Then ระบบต้องแสดงเฉพาะ record ที่สำเร็จ และไม่รวมการพยายามเช็คที่ไม่ผ่าน
- ยังขาด: ไม่มี

## เฟส 5: คณะกรรมการดูสรุปการเข้าร่วม (AC-ATT-08, AC-ATT-10)

### T-09 สร้างแดชบอร์ดคณะกรรมการและรายชื่อสถานะผู้เข้าร่วม
- รองรับ: FR-ATT-13, FR-ATT-16, CON-ATT-08, NFR-SEC-02
- ตรวจด้วย: AC-ATT-08, AC-ATT-10
- ไฟล์ที่แตะ: `frontend/src/pages/CommitteeAttendancePage.jsx`, `frontend/src/api/client.js`, `backend/app/api/committee.py`, `backend/app/services/committee_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: คณะกรรมการเห็นรายชื่อผู้เข้าร่วมพร้อมสถานะ “เข้าร่วม” หรือ “ยังไม่เช็ค” สำหรับทุกคน และสถานะ “ยังไม่เช็ค” แสดงเมื่อผู้เข้าร่วมยังไม่ได้เช็คในรอบที่เลือก
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 5
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_08_committee_sees_all_attendance_status`, `test_AC_ATT_10_unchecked_attendance_status_is_displayed`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev`
- คนลองเองตาม AC-ATT-08 และ AC-ATT-10:
  Given มีผู้เข้าร่วมค่ายในระบบหลายคน และบางคนมีเช็คเข้าร่วมแล้ว บางคนยังไม่เช็ค
  When คณะกรรมการเปิดหน้าตรวจสอบการเข้าร่วม
  Then ระบบต้องแสดงรายชื่อผู้เข้าร่วมทุกคนพร้อมสถานะ “เข้าร่วม” หรือ “ยังไม่เช็ค” ตามจริง
- ยังขาด: ไม่มี

## เฟส 6: คณะกรรมการดูรายละเอียดเช็คเข้าร่วมรายคน (AC-ATT-09)

### T-10 สร้างหน้าดูรายละเอียดการเช็คเข้าร่วมรายบุคคล
- รองรับ: FR-ATT-14, FR-ATT-15, CON-ATT-08, NFR-SEC-02, NFR-DATA-03
- ตรวจด้วย: AC-ATT-09
- ไฟล์ที่แตะ: `frontend/src/pages/CommitteeAttendanceDetailPage.jsx`, `frontend/src/api/client.js`, `backend/app/api/committee.py`, `backend/app/services/committee_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: เมื่อคณะกรรมการเปิดรายละเอียดของผู้เข้าร่วมคนใดคนหนึ่ง ระบบแสดงวันที่ รอบเวลา สถานะ เวลา latitude longitude และระยะห่างจากสถานที่ค่ายจาก record ที่สำเร็จเท่านั้น
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 6
- test ที่ต้องผ่านทั้งหมด: `test_AC_ATT_09_committee_detail_view_contains_required_fields`
- เปิดระบบ: `uvicorn backend.app.main:app --reload` และ `npm run dev`
- คนลองเองตาม AC-ATT-09:
  Given ผู้เข้าร่วมมีข้อมูลการเช็คเข้าร่วมที่สำเร็จ
  When คณะกรรมการเปิดรายละเอียดของผู้เข้าร่วมคนนั้น
  Then ระบบต้องแสดงวันที่ รอบเวลา สถานะ เวลา latitude longitude และระยะห่างจากสถานที่ค่าย
- ยังขาด: ไม่มี

## ตารางตรวจความครบ

### 1) AC ID | task ที่ตรวจ AC นี้

| AC ID | task ที่ตรวจ AC นี้ |
| --- | --- |
| AC-ATT-01 | T-03 |
| AC-ATT-02 | T-04 |
| AC-ATT-03 | T-05 |
| AC-ATT-04 | T-06 |
| AC-ATT-05 | T-06 |
| AC-ATT-06 | T-04, T-07 |
| AC-ATT-07 | T-08 |
| AC-ATT-08 | T-09 |
| AC-ATT-09 | T-10 |
| AC-ATT-10 | T-09 |

### 2) Constraint ID | task ที่ทำให้เป็นจริง

| Constraint ID | task ที่ทำให้เป็นจริง |
| --- | --- |
| CON-ATT-01 | T-01, T-02 |
| CON-ATT-02 | T-04 |
| CON-ATT-03 | T-01, T-03 |
| CON-ATT-04 | T-05, T-06 |
| CON-ATT-05 | T-01, T-06 |
| CON-ATT-06 | T-05 |
| CON-ATT-07 | T-04, T-08 |
| CON-ATT-08 | T-09, T-10 |
| IF-ATT-01 | T-04, T-07 |
| IF-ATT-02 | T-06 |
| IF-ATT-03 | T-06 |

### 3) FR ID | AC ที่ตรวจ FR นี้ | เฟส

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
| --- | --- | --- |
| FR-ATT-01 | AC-ATT-01 | เฟส 1 |
| FR-ATT-02 | AC-ATT-01 | เฟส 1 |
| FR-ATT-03 | AC-ATT-02, AC-ATT-06 | เฟส 2 |
| FR-ATT-04 | AC-ATT-03 | เฟส 2 |
| FR-ATT-05 | AC-ATT-03, AC-ATT-04 | เฟส 2, 3 |
| FR-ATT-06 | AC-ATT-03 | เฟส 2 |
| FR-ATT-07 | AC-ATT-04, AC-ATT-06 | เฟส 3 |
| FR-ATT-08 | AC-ATT-03 | เฟส 2 |
| FR-ATT-09 | AC-ATT-03 | เฟส 2 |
| FR-ATT-10 | AC-ATT-03 | เฟส 2 |
| FR-ATT-11 | AC-ATT-05 | เฟส 3 |
| FR-ATT-12 | AC-ATT-07 | เฟส 4 |
| FR-ATT-13 | AC-ATT-08 | เฟส 5 |
| FR-ATT-14 | AC-ATT-09 | เฟส 6 |
| FR-ATT-15 | AC-ATT-09 | เฟส 6 |
| FR-ATT-16 | AC-ATT-10 | เฟส 5 |

## สิ่งที่ยังไม่ทำ
- ไม่มี Open Questions ใน spec ปัจจุบันหลังจากขั้น clarify แล้ว
- ไม่มี task ใดที่รอ Q-xx

