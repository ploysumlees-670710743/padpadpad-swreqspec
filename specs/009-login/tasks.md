# Tasks: เข้าสู่ระบบ (Authentication & Role Authorization)

- Feature: UC-09 เข้าสู่ระบบ
- Spec ID: 009-login
- อ้างอิง: [plan.md](./plan.md)
- วันที่: 2569-11-09

สรุป:
- เฟสทั้งหมด: 4 เฟส (เฟส 0 ถึงเฟส 3)
- งานย่อย: 8 tasks, 0 task รอ Open Questions
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 (เข้าสู่ระบบสำเร็จและเห็นเมนูตามบทบาท)

## เฟส 0: ฐานรากบัญชีผู้ใช้และการยืนยันตัวตน

### T-01 สร้างโมเดลและตารางบัญชีผู้ใช้
- รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-01, ASM-LOG-02, ASM-LOG-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02 ถึง T-08
- ไฟล์ที่แตะ: `backend/app/models/user_account.py`, `backend/db/schema.sql`, `backend/tests/test_login_schema_foundation.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ตารางและโมเดลเก็บ username, password hash, สถานะ Active/ถูกระงับ และ role โดยไม่เก็บ Plaintext Password และมี test ยืนยันสถานะ/บทบาทที่รองรับ
- สถานะ: เสร็จ

### T-02 สร้างบริการตรวจรหัสผ่านและบทบาทบัญชี
- รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-02, ASM-LOG-03 และข้อกำหนด Security ใน spec (ไม่มี ID)
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 ถึง T-08
- ไฟล์ที่แตะ: `backend/app/services/authentication_service.py`, `backend/app/middleware/auth.py`, `backend/tests/test_login_authentication_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: บริการตรวจ username/password, สถานะ Active และ role ที่อนุญาตจากข้อมูลบัญชี โดยไม่มีการบันทึกรหัสผ่านลง log
- สถานะ: เสร็จ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_login_schema_foundation`, `test_login_authentication_service`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload`; คำสั่งเปิดหน้าจอ `npm --prefix frontend run dev`
- คนลองเองตามฐานราก:
  Given มีบัญชีผู้ใช้ที่เก็บรหัสผ่านแบบไม่ใช่ Plaintext และมี role/status
  When ตรวจสอบข้อมูลบัญชีผ่านบริการ authentication
  Then ระบบแยกบัญชี Active ที่มี role อนุญาตออกจากบัญชีที่ไม่ผ่านเงื่อนไข
- ยังขาด: ไม่มี

## เฟส 1: เข้าสู่ระบบสำเร็จและแสดงเมนูตามบทบาท (AC-LOG-01)

### T-03 สร้าง API เข้าสู่ระบบและคืนเมนูตามบทบาท
- รองรับ: FR-LOG-02, FR-LOG-03, FR-LOG-04, FR-LOG-05, AC-LOG-01
- ตรวจด้วย: AC-LOG-01
- ไฟล์ที่แตะ: `backend/app/api/authentication.py`, `backend/main.py`, `backend/app/services/authentication_service.py`, `backend/tests/test_AC_LOG_01.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `test_AC_LOG_01_login_success_by_role` ยืนยันว่าบัญชี Active ของนักศึกษา คณะกรรมการ และอาจารย์เข้าสู่หน้าหลักพร้อมเมนูของ role ตนเอง
- สถานะ: เสร็จ

### T-04 สร้างหน้า Login และหน้าหลักตามบทบาท
- รองรับ: FR-LOG-01, FR-LOG-02, FR-LOG-05, AC-LOG-01 และข้อกำหนด Responsive Design ใน spec (ไม่มี ID)
- ตรวจด้วย: AC-LOG-01
- ไฟล์ที่แตะ: `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RoleHomePage.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_LOG_01.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_LOG_01_login_success_by_role_ui` ผ่านด้วย mock client และผู้ใช้เห็นหน้าหลัก/เมนูตรงกับบทบาท
- สถานะ: เสร็จ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_login_schema_foundation`, `test_login_authentication_service`, `test_AC_LOG_01_login_success_by_role` (API และ UI)
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-LOG-01:
  Given ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบและมีบัญชี Active
  When กรอกชื่อผู้ใช้และรหัสผ่านถูกต้อง
  Then ระบบนำไปหน้าหลักและแสดงเมนูเฉพาะบทบาทของผู้ใช้งาน
- ยังขาด: ไม่มี

## เฟส 2: แจ้งข้อมูลเข้าสู่ระบบไม่ถูกต้อง (AC-LOG-02)

### T-05 ปฏิเสธข้อมูลเข้าสู่ระบบที่ไม่ถูกต้อง
- รองรับ: FR-LOG-03, FR-LOG-06, AC-LOG-02
- ตรวจด้วย: AC-LOG-02
- ไฟล์ที่แตะ: `backend/app/api/authentication.py`, `backend/app/services/authentication_service.py`, `backend/tests/test_AC_LOG_02.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_LOG_02_invalid_credentials` ยืนยันว่าข้อมูลผิดไม่สร้าง session และคืนผลให้แสดงข้อความตาม spec
- สถานะ: เสร็จ

### T-06 แสดงข้อความเมื่อชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
- รองรับ: FR-LOG-06, AC-LOG-02
- ตรวจด้วย: AC-LOG-02
- ไฟล์ที่แตะ: `frontend/src/pages/LoginPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_LOG_02.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-04, T-05
- เสร็จเมื่อ: `test_AC_LOG_02_invalid_credentials_ui` ผ่านด้วย mock client โดยแสดงข้อความ “ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง” และคงหน้า Login
- สถานะ: เสร็จ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: tests ของเฟส 0–1 และ `test_AC_LOG_02_invalid_credentials`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-LOG-02:
  Given ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบ
  When กรอกชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
  Then ระบบแสดงข้อความ “ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง” และคงหน้า Login
- ยังขาด: ไม่มี

## เฟส 3: ปฏิเสธบัญชีที่ไม่มีสิทธิ์ (AC-LOG-03)

### T-07 ปฏิเสธบัญชีถูกระงับหรือมี role ที่ไม่อนุญาต
- รองรับ: FR-LOG-03, FR-LOG-04, FR-LOG-07, AC-LOG-03
- ตรวจด้วย: AC-LOG-03
- ไฟล์ที่แตะ: `backend/app/api/authentication.py`, `backend/app/services/authentication_service.py`, `backend/tests/test_AC_LOG_03.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-05
- เสร็จเมื่อ: `test_AC_LOG_03_unauthorized_account` ยืนยันว่าบัญชีถูกระงับหรือ role นอกเหนือจากสามบทบาทไม่ได้รับ session และ API ปฏิเสธการเข้าสู่ระบบ
- สถานะ: เสร็จ รอทีมตรวจ

### T-08 แสดงข้อความเมื่อบัญชีไม่มีสิทธิ์
- รองรับ: FR-LOG-07, AC-LOG-03
- ตรวจด้วย: AC-LOG-03
- ไฟล์ที่แตะ: `frontend/src/pages/LoginPage.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC_LOG_03.test.jsx`
- แบบหน้าจอ: ไม่มี UI ID และไม่มี mockup ใน spec; ทีมออกแบบเองตาม plan.md
- ต้องทำหลัง: T-06, T-07
- เสร็จเมื่อ: `test_AC_LOG_03_unauthorized_account_ui` ผ่านด้วย mock client โดยแสดงข้อความ “บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ” และคงหน้า Login
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: tests ของเฟส 0–2 และ `test_AC_LOG_03_unauthorized_account`
- เปิดระบบ: Backend `python -m uvicorn backend.main:app --reload` และ frontend `npm --prefix frontend run dev`
- คนลองเองตาม AC-LOG-03:
  Given ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบและบัญชีถูกระงับหรือมี role ที่ไม่อนุญาต
  When พยายามเข้าสู่ระบบ
  Then ระบบปฏิเสธ แสดงข้อความตาม spec และคงหน้า Login
- ยังขาด: ไม่มี

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-LOG-01 | T-03, T-04 |
| AC-LOG-02 | T-05, T-06 |
| AC-LOG-03 | T-07, T-08 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| ไม่มี ID: รองรับ Chrome, Firefox, Safari, Edge | T-04 |
| ไม่มี ID: ส่ง credential ผ่าน HTTPS | T-03, T-04 |
| ไม่มี ID: ทำงานร่วมกับฐานข้อมูลหลัก | T-01, T-02 |
| ไม่มี ID: ไม่บันทึก Plaintext Password ใน Log | T-02, T-05, T-07 |
| ไม่มี ID: login ตอบสนองไม่เกิน 2 วินาทีในสภาวะโหลดปกติ | T-03 |
| ไม่มี ID: Responsive Design | T-04 |

### Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-LOG-01 | AC-LOG-01 | เฟส 1 |
| FR-LOG-02 | AC-LOG-01, AC-LOG-02, AC-LOG-03 | เฟส 1–3 |
| FR-LOG-03 | AC-LOG-01, AC-LOG-02, AC-LOG-03 | เฟส 0–3 |
| FR-LOG-04 | AC-LOG-01, AC-LOG-03 | เฟส 0–3 |
| FR-LOG-05 | AC-LOG-01 | เฟส 1 |
| FR-LOG-06 | AC-LOG-02 | เฟส 2 |
| FR-LOG-07 | AC-LOG-03 | เฟส 3 |

## สิ่งที่ยังไม่ทำ

ไม่มี Open Questions ใน spec.md ฉบับ Draft v2; จึงไม่มี task ที่รอคำตอบ
