# Tasks: ลงคะแนนและสรุปผลสถานที่

- Feature: ลงคะแนนและสรุปผลสถานที่ (Vote Location)
- Spec ID: UC-08
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-10-19

สรุป 3 บรรทัด:
- เฟสทั้งหมด: 5 เฟส (เฟส 0, 1, 2, 3 และรอคำตอบ)
- งานย่อย: 9 tasks, 2 tasks รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 หลังได้คำตอบ Q-02 และเชื่อมแหล่งข้อมูลสถานที่

## เฟส 0: โครงสร้างข้อมูลการลงคะแนน

### T-01 สร้างโมเดลและ schema สำหรับสิทธิ์กับบัตรลงคะแนน
- รองรับ: FR-VOT-04, CON-TECH-01, CON-DATA-01, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02 และ T-04
- ไฟล์ที่แตะ: `backend/app/models/vote.py`, `backend/db/schema.sql`, `backend/tests/test_vote_task_t01.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: schema แยกข้อมูลการใช้สิทธิ์ของผู้ใช้จากบัตรลงคะแนน ไม่มีความเชื่อมโยงผู้ลงคะแนนกับสถานที่ และกำหนด unique constraint ต่อผู้ใช้/รอบพร้อม transaction ได้
- สถานะ: เสร็จ รอทีมตรวจ

## เฟส 1: ลงคะแนนสำเร็จ (AC-VOT-01)

### T-02 สร้าง API บันทึกคะแนนและคำนวณผลรวม
- รองรับ: FR-VOT-03, FR-VOT-04, FR-VOT-05, CON-TECH-01, CON-DATA-01, NFR-PERF-01
- ตรวจด้วย: AC-VOT-01
- ไฟล์ที่แตะ: `backend/app/api/votes.py`, `backend/app/services/vote_service.py`, `backend/app/main.py`, `backend/db/schema.sql`, `backend/tests/test_AC_VOT_01.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `POST /api/votes` รับ `round_id` และ `location_id`; ระบุตัวผู้ใช้จาก trusted authentication เท่านั้น; API บันทึกหนึ่งคะแนนต่อผู้ใช้/รอบภายใน transaction และตอบ HTTP 200 พร้อม `total_votes` และ `has_voted` โดยไม่บันทึกความเชื่อมโยงตัวตนกับสถานที่
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 สร้างหน้ารายการและยืนยันการลงคะแนน
- รองรับ: FR-VOT-01, FR-VOT-03, FR-VOT-05, NFR-USE-01
- ตรวจด้วย: AC-VOT-01
- ไฟล์ที่แตะ: `frontend/src/pages/VoteLocationPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/test_AC_VOT_01.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: หน้าจอเรียก API ผ่าน client แสดงรายละเอียดสถานที่ เลือกได้หนึ่งแห่ง ยืนยันคะแนน และเห็นยอดรวมที่อัปเดต
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_VOT_01_vote_once_and_update_total`, `test_AC_VOT_01_vote_page_select_and_confirm`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-VOT-01:
  Given ผู้มีสิทธิ์เข้าสู่ระบบและยังไม่เคยใช้สิทธิ์ โดยมีสถานที่ที่ผ่านการพิจารณาในระบบ
  When เลือกสถานที่หนึ่งแห่งและยืนยันการลงคะแนน
  Then คะแนนถูกบันทึก ยอดรวมเพิ่ม และบัญชีผู้ใช้ถูกทำเครื่องหมายว่าใช้สิทธิ์แล้ว
- ยังขาด: การระบุแหล่งข้อมูลและรูปแบบข้อมูลสถานที่ตาม Q-02

## เฟส 2: ป้องกันการลงคะแนนซ้ำ (AC-VOT-02)

### T-04 ปฏิเสธคะแนนซ้ำและคืน HTTP 409
- รองรับ: FR-VOT-04, FR-VOT-06, CON-TECH-01, NFR-SEC-01, NFR-PERF-01
- ตรวจด้วย: AC-VOT-02
- ไฟล์ที่แตะ: `backend/app/services/vote_service.py`, `backend/app/api/votes.py`, `backend/tests/test_AC_VOT_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: การส่งคะแนนซ้ำไม่เปลี่ยนยอดรวมและ API ตอบ HTTP 409 พร้อมข้อความแจ้งว่าใช้สิทธิ์ไปแล้ว
- สถานะ: พร้อมทำ

### T-05 ปิดปุ่มยืนยันและแสดงข้อความเมื่อใช้สิทธิ์แล้ว
- รองรับ: FR-VOT-06, NFR-SEC-01, NFR-USE-01
- ตรวจด้วย: AC-VOT-02
- ไฟล์ที่แตะ: `frontend/src/pages/VoteLocationPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/test_AC_VOT_02.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-03, T-04
- เสร็จเมื่อ: ผู้ใช้ที่ใช้สิทธิ์แล้วไม่สามารถกดยืนยันซ้ำ และเห็นข้อความแจ้งเตือนตาม spec
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_VOT_01_vote_once_and_update_total`, `test_AC_VOT_01_vote_page_select_and_confirm`, `test_AC_VOT_02_reject_duplicate_vote`, `test_AC_VOT_02_disable_repeat_confirmation`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-VOT-02:
  Given ผู้ใช้ลงคะแนนในรอบปัจจุบันไปแล้ว
  When พยายามยืนยันการลงคะแนนอีกครั้ง
  Then ระบบไม่เพิ่มคะแนนและแสดงข้อความว่าใช้สิทธิ์ไปแล้ว
- ยังขาด: การเชื่อมข้อมูลรายการสถานที่ยังขึ้นกับ Q-02

## เฟส 3: ปฏิเสธผู้ใช้งานที่ไม่มีสิทธิ์ (AC-VOT-03)

### T-06 ปฏิเสธ API เมื่อผู้ใช้ไม่มี Role สำหรับลงคะแนน
- รองรับ: FR-VOT-02, CON-SEC-01, NFR-SEC-01
- ตรวจด้วย: AC-VOT-03
- ไฟล์ที่แตะ: `backend/app/api/votes.py`, `backend/app/middleware/authz.py`, `backend/tests/test_AC_VOT_03.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ผู้ใช้ที่ไม่มี Role `lecturer` หรือ `committee` ถูกปฏิเสธด้วย HTTP 403 และระบบยืนยันตัวตนขัดข้องถูกปฏิเสธตามข้อความใน spec
- สถานะ: พร้อมทำ

### T-07 ซ่อนปุ่มลงคะแนนสำหรับผู้ไม่มีสิทธิ์
- รองรับ: FR-VOT-02, CON-SEC-01, NFR-USE-01
- ตรวจด้วย: AC-VOT-03
- ไฟล์ที่แตะ: `frontend/src/pages/VoteLocationPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/test_AC_VOT_03.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: ผู้ใช้ที่ไม่ใช่อาจารย์/คณะกรรมการไม่เห็นปุ่มลงคะแนน และกรณีระบบยืนยันตัวตนขัดข้องเห็นข้อความแจ้งเตือนตาม spec
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: test ทุกตัวจากเฟส 1-3 ได้แก่ `test_AC_VOT_01_vote_once_and_update_total`, `test_AC_VOT_01_vote_page_select_and_confirm`, `test_AC_VOT_02_reject_duplicate_vote`, `test_AC_VOT_02_disable_repeat_confirmation`, `test_AC_VOT_03_forbid_ineligible_user`, `test_AC_VOT_03_hide_vote_action_for_student`
- เปิดระบบ: Backend `uvicorn backend.app.main:app --reload`; Frontend `npm run dev --prefix frontend`
- คนลองเองตาม AC-VOT-03:
  Given ผู้ใช้เข้าสู่ระบบด้วยสิทธิ์นักศึกษาทั่วไป
  When เปิดหน้าลงคะแนนหรือส่งคำขอลงคะแนนผ่าน API
  Then ไม่เห็นปุ่มลงคะแนนและ API ปฏิเสธด้วย HTTP 403
- ยังขาด: ไม่มี

## เฟสสุดท้าย: รอคำตอบ

### T-08 เชื่อมรายการสถานที่กับแหล่งข้อมูลที่ทีมกำหนด
- รองรับ: FR-VOT-01, FR-VOT-03, FR-VOT-05
- ตรวจด้วย: AC-VOT-01
- ไฟล์ที่แตะ: `backend/app/services/vote_service.py`, `backend/app/api/votes.py`, `frontend/src/pages/VoteLocationPage.jsx`, `frontend/src/api/client.js`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: รายการสถานที่ที่ผ่านเกณฑ์พร้อมชื่อ รูปภาพ และสรุปผลสำรวจเบื้องต้นมาจากแหล่งข้อมูลและรูปแบบที่ทีมยืนยัน
- สถานะ: รอ Q-02

### T-09 แสดงผลกรณีคะแนนเสมอตามมติทีม
- รองรับ: FR-VOT-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานต่อยอดจาก AC-VOT-01
- ไฟล์ที่แตะ: `backend/app/services/vote_service.py`, `frontend/src/pages/VoteLocationPage.jsx`
- แบบหน้าจอ: ไม่มี mockup ทีมออกแบบเอง
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: ระบบแสดงหรือจัดการคะแนนเสมอตามวิธีที่คณะกรรมการเลือก โดยไม่กำหนดผู้ชนะเอง
- สถานะ: รอ Q-01

## ตารางตรวจความครบ

### AC ID | task ที่ตรวจ AC นี้
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-VOT-01 | T-02, T-03, T-08 |
| AC-VOT-02 | T-04, T-05 |
| AC-VOT-03 | T-06, T-07 |

### Constraint ID | task ที่ทำให้เป็นจริง
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-SEC-01 | T-06, T-07 |
| CON-TECH-01 | T-01, T-02, T-04 |
| CON-DATA-01 | T-01, T-02 |

### FR ID | AC ที่ตรวจ FR นี้ | เฟส
| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-VOT-01 | AC-VOT-01 | 1, รอคำตอบ |
| FR-VOT-02 | AC-VOT-03 | 3 |
| FR-VOT-03 | AC-VOT-01 | 1 |
| FR-VOT-04 | AC-VOT-01, AC-VOT-02 | 1, 2 |
| FR-VOT-05 | AC-VOT-01 | 1 |
| FR-VOT-06 | AC-VOT-02 | 2 |

## สิ่งที่ยังไม่ทำ
- Q-01: หากคะแนนเท่ากันจะใช้วิธีใดในการตัดสินหรือแสดงผลให้คณะกรรมการเลือกต่อ? (ต้องถามคณะกรรมการ) — T-09 รอคำตอบ
- Q-02: รายการสถานที่ที่ผ่านเกณฑ์พิจารณาและการแสดงผลสรุปข้อมูลเบื้องต้น ต้องใช้ข้อมูลจากแหล่งใดบ้างและมีกำหนดรูปแบบข้อมูลอย่างไร? (ต้องถามคณะกรรมการ) — T-08 รอคำตอบ
