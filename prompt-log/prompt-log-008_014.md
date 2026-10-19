# Prompt log

บันทึกทุกครั้งที่ใช้ AI กับ repo นี้ เขียนต่อท้ายเรื่อย ๆ ไม่ต้องลบของเก่า

---

## 2026-09-20 06:30 คำสั่ง: /clarify

- เครื่องมือ: Copilot in Codespaces
- ไฟล์: specs/008-vote-location/spec.md (v1)

### คำถามที่ AI ถาม (ทั้งหมด)

1. การสรุปคะแนนควรแสดงผลแบบ Real-time ทันทีที่มีคนโหวต หรือรอจนกว่าจะปิดรอบการลงคะแนน?
2. “อาจารย์หรือคณะกรรมการที่มีรายชื่อในรอบปัจจุบัน” หมายถึงใครและมาจากแหล่งข้อมูลใด?
3. เมื่อระบบยืนยันตัวตน (SSO/ระบบกลาง) ล้มเหลวหรือไม่ตอบ ต้องจัดการอย่างไร?
4. การป้องกันการส่ง Request ซ้ำซ้อนควรป้องกันแบบใดเมื่อผู้ใช้กดส่งซ้ำหรือส่งคำขอซ้ำในเวลาเดียวกัน?
5. ผู้มีสิทธิ์โหวตแต่ละรอบมีจำนวนโหวตต่อคนเท่าไร และใช้งานต่อรอบได้กี่ครั้ง?
6. เมื่อต้องแสดงผลคะแนนเท่ากัน ควรให้แสดงเป็น “ทั้งหมดที่เท่ากัน” หรือให้เลือกผู้ชนะอัตโนมัติด้วยเงื่อนไขใด?
7. กรณีผู้ใช้งานไม่มีสิทธิ์ ให้ปฏิเสธที่ระดับหน้าจอเท่านั้นหรือรวมทั้ง API/backend ด้วย?
8. รายการสถานที่ที่ “ผ่านเกณฑ์พิจารณา” ควรแสดงข้อมูลขั้นต่ำอะไรบ้างเพื่อให้ผู้ใช้เลือกได้?

### คำตอบของทีมและเหตุผล

1. ทีมตัดสินใจเองว่า (ASM) ให้แสดงผลคะแนนแบบ Real-time ไปก่อน เพื่อความโปร่งใสและเห็นความคืบหน้า
2. ทีมตัดสินใจเองว่า (ASM) ตรวจสอบจาก Role `lecturer` และ `committee` ในฐานข้อมูลของระบบ
3. ปฏิเสธการเข้าถึงและแจ้งเตือน "ระบบยืนยันตัวตนขัดข้อง" (ตัดสินใจด้านเทคนิค)
4. ป้องกันการส่งซ้ำทั้งหน้าบ้าน (Disable ปุ่ม) และหลังบ้าน (Database Unique Constraint) ตอบ HTTP 409
5. 1 คน 1 เสียง และไม่สามารถแก้ไขคะแนนหลังยืนยันได้ (อิงตาม Use Case เดิม)
6. ไม่รู้ ต้องถามคณะกรรมการว่าถ้าคะแนนเท่ากันจะใช้วิธีใดตัดสิน (บันทึกเป็น Open Question Q-01)
7. ปฏิเสธทั้งระดับ UI (ซ่อนปุ่ม) และ API (ส่งกลับ HTTP 403)
8. ทีมตัดสินใจเองว่า (ASM) แสดงชื่อสถานที่, รูปภาพ, และสรุปผลสำรวจเบื้องต้น

### สิ่งที่แก้ใน spec.md (v1 เป็น v2)

- เปลี่ยน Status จาก Draft v1 เป็น Draft v2
- ปรับ In-Scope ให้ระบุรายการสถานที่แสดงชื่อสถานที่ รูปภาพ และสรุปผลสำรวจเบื้องต้น
- ปรับ FR-VOT-02 ให้ระบุตรวจสอบจาก Role `lecturer` และ `committee`
- ปรับ FR-VOT-05 ให้ระบุการอัปเดตคะแนนแบบ Real-time
- ปรับ CON-SEC-01 ให้ระบุพฤติกรรมเมื่อระบบยืนยันตัวตนขัดข้อง
- ปรับ AC-VOT-03 ให้ระบุซ่อนปุ่มใน UI และปฏิเสธ API ด้วย HTTP 403
- เพิ่ม Assumptions ใหม่: ASM-02 ถึง ASM-06 ตามคำตอบของทีม
- เพิ่ม Open Question Q-01, Q-02 สำหรับกรณีคะแนนเท่ากันและข้อมูลสถานที่ที่ผ่านเกณฑ์พิจารณา

---

## 2026-09-20 06:52 คำสั่ง: /clarify

- เครื่องมือ: Copilot in Codespaces
- ไฟล์: specs/014-manage-application-status/spec.md (v1)

### คำถามที่ AI ถาม (ทั้งหมด)

1. กำหนดเวลายืนยันสิทธิ์คือกี่วันหลังประกาศผล?
2. เมื่อหมดเวลายืนยันสิทธิ์ ระบบควรเปลี่ยนสถานะเป็น “สละสิทธิ์” ทันทีหรือเมื่อกระบวนการรันเช็กเวลาในรอบถัดไป?
3. “ข้อมูลสรุปรายละเอียดค่าย” ในหน้าสถานะควรมีข้อมูลอะไรบ้างที่ต้องแสดงให้เห็น?
4. การยืนยันสิทธิ์และสละสิทธิ์ต้องป้องกันการกดพลาดด้วยโหมดใด?
5. การ “ล็อกไม่ให้นักศึกษาแก้ไขสถานะได้อีก” ต้องบังคับที่ระดับไหน?
6. เมื่อนักศึกษากดสละสิทธิ์แล้ว ระบบควรแสดงข้อความหรืออีเมลอะไรให้ทราบหรือไม่?
7. หากนักศึกษาเข้าสู่ระบบด้วยบัญชีที่ไม่ใช่เจ้าของใบสมัคร จะต้องแสดงผลอย่างไร?
8. สถานะ “ยืนยันสิทธิ์” และ “สละสิทธิ์” ต้องบันทึกเวลาในรูปแบบใดและมี timezone แบบไหน?

### คำตอบของทีมและเหตุผล

1. ไม่รู้ ต้องถามคณะกรรมการจัดค่ายว่ากำหนดระยะเวลายืนยันสิทธิ์กี่วันหลังประกาศผล (บันทึกเป็น Open Question Q-01)
2. ทีมตัดสินใจเองว่า (ASM) ให้มี Scheduled Job/Cron Job ตรวจสอบเวลาทุกชั่วโมง หากพ้น Deadline ให้ปรับสถานะเป็น "สละสิทธิ์" อัตโนมัติ
3. ทีมตัดสินใจเองว่า (ASM) แสดงข้อมูลพื้นฐานคือ ชื่อค่าย, วัน-เวลาที่จัดกิจกรรม, สถานที่จัดค่าย, เอกสารหรือข้อปฏิบัติที่ต้องเตรียมตัว และสถานะของผู้สมัคร
4. ทีมตัดสินใจเองว่า แสดง Modal / Confirmation Dialog ยืนยันก่อนบันทึกเสมอ เพื่อป้องกันการกดพลาด
5. บล็อกทั้งระดับ UI (ปิดปุ่มกด) และระดับ Backend API โดยตรวจสอบ State ในฐานข้อมูล หากมีสถานะยืนยันหรือสละสิทธิ์ไปแล้วจะปฏิเสธคำขอด้วย HTTP 400/409
6. ทีมตัดสินใจเองว่า (ASM) แสดง Pop-up ข้อความยืนยันผลบนหน้าเว็บทันที และส่งอีเมลแจ้งเตือนสรุปการสละสิทธิ์ไปยังอีเมลของนักศึกษา
7. ปฏิเสธการเข้าถึงทันทีด้วย HTTP 403 Forbidden และแสดงหน้าแจ้งเตือนว่า "ไม่มีสิทธิ์เข้าถึงข้อมูลใบสมัครนี้" โดยไม่เปิดเผยข้อมูลใดๆ
8. ทีมตัดสินใจเองว่า บันทึก Timestamp ลงฐานข้อมูลเป็น UTC (ISO 8601) และทำการแปลงเป็นเวลาท้องถิ่น (Asia/Bangkok, GMT+7) เมื่อแสดงผลบนหน้าจอ

### สิ่งที่แก้ใน spec.md (v1 เป็น v2)

- เปลี่ยน Status จาก Draft v1 เป็น Draft v2
- ระบุ Scheduled Job/Cron Job สำหรับตรวจสภาพ Deadline ทุกชั่วโมง
- ระบุข้อมูลพื้นฐานที่แสดงในหน้าสถานะ และปรับ AC-STA-01 ให้ครอบคลุมข้อมูลดังกล่าว
- ระบุการป้องกันการกดพลาดด้วย Modal / Confirmation Dialog
- ระบุการบล็อกทั้ง UI และ Backend API พร้อม HTTP 400/409 เมื่อมีสถานะแล้ว
- ระบุการแจ้งผลสละสิทธิ์บนหน้าเว็บและอีเมล
- ระบุเหตุการณ์ HTTP 403 Forbidden สำหรับการเข้าถึงข้อมูลที่ไม่ได้รับสิทธิ์
- ระบุการจัดเก็บ timestamp เป็น UTC และแปลงเป็นเวลาไทยเมื่อแสดงผล
- เพิ่ม Assumptions ใหม่: ASM-02 ถึง ASM-07
- รักษา Open Question Q-01 สำหรับระยะเวลายืนยันสิทธิ์ที่ยังต้องถามคณะกรรมการจัดค่าย

---

## 2026-10-19 คำสั่ง: ตรวจเทคโนโลยี, เติม Backend ใน plan.md และ /tasks

- เครื่องมือ: Copilot ใน VS Code
- ไฟล์: `specs/008-vote-location/` และ `specs/014-manage-application-status/`

### คำถามที่ AI ถาม

1. หาก spec และ plan ไม่ระบุเทคโนโลยี จะให้ใช้แนวทางที่มีใน repo (Python/FastAPI, SQLite/SQL, React/JSX) โดยระบุว่าเป็นตัวเลือกของทีม ไม่ได้มาจาก spec หรือไม่?

### คำตอบของทีม

1. ใช้แนวทางที่มีใน repo

### ผลลัพธ์

- เพิ่มแนวทาง Backend และ Frontend ใน plan ของทั้งสองฟีเจอร์ โดยระบุเทคโนโลยีเป็นตัวเลือกของทีม ไม่ใช่ข้อกำหนดจาก spec
- สร้าง tasks.md ของ UC-08 จำนวน 9 tasks และ UC-14 จำนวน 8 tasks พร้อมตาราง traceability, จุดตรวจ และ task ที่รอ Open Question
- Q-01 และ Q-02 ของ UC-08 ยังรอคำตอบ; Q-01 ของ UC-14 ยังรอคำตอบ จึงไม่กำหนดพฤติกรรม/ค่าแทนทีม

---

### แก้รอบที่ 1: ปรับ T-01 ของ UC-14 ก่อนเริ่ม implement

- เพิ่ม `backend/db/schema.sql` และ `backend/app/middleware/auth.py` ในรายการไฟล์ของ T-01 ตามคำตอบทีม เพื่อให้มีแหล่งข้อมูลใบสมัคร/รายละเอียดค่ายและจุดเชื่อม Authentication ที่ปฏิเสธโดยปริยายเมื่อยังไม่มี SSO
- เหตุผล: รายการไฟล์เดิมไม่ครอบคลุมแหล่งข้อมูลที่ AC-STA-01 ต้องแสดงและการตรวจเจ้าของใบสมัครตาม CON-SEC-01; ต้องแก้ task ก่อนเริ่มทำเพื่อไม่แตะไฟล์นอกขอบเขต

---

## 2026-10-19 คำสั่ง: /testcase AC-STA-01 specs/014-manage-application-status/

- โหมด: ร่าง
- TC ID ที่เสนอ: TC-STA-01-1 ถึง TC-STA-01-9
- ผล: เพิ่ม test cases 9 แถวเป็นสถานะ "ร่าง"; ยังไม่เขียนโค้ด test เพราะต้องให้ทีมตรวจและเปลี่ยนสถานะเป็น "ใช้ได้" ก่อน
- จุดที่ spec ยังไม่บอกผลที่คาดหวัง: ผู้ใช้ที่ยังไม่เข้าสู่ระบบ และกรณีใบสมัครยังไม่มีผลประกาศ
- Implementation T-01 ยังไม่เริ่ม เพราะทีมเลือกให้รอเตรียม tooling (FastAPI/pytest และ frontend package setup)

---

### แก้รอบที่ 2: ขยาย T-01 ให้รวม tooling ที่จำเป็น

- ทีมยืนยันว่าเริ่ม T-01 ได้โดยไม่ต้องรอ task อื่น และอนุญาตให้เพิ่ม tooling หากไม่มีผลเสียสำคัญต่อโปรเจกต์
- เพิ่ม `requirements.txt`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html` และ `frontend/src/main.jsx` ในรายการไฟล์ T-01 เพื่อให้ติดตั้ง dependencies และเปิดหน้า React/Vite ที่ task นี้ต้องสร้างได้
- เพิ่ม `.gitignore` เพื่อกันไฟล์ฐานข้อมูล runtime และ build output ที่ task สร้าง ไม่ให้กลายเป็นไฟล์ข้อมูล/ผลลัพธ์ที่ commit โดยไม่ตั้งใจ
- ผลกระทบที่แจ้งทีม: เพิ่ม dependencies/lockfile ที่ต้องดูแลและติดตั้ง; ไม่เปลี่ยนพฤติกรรมของฟีเจอร์เดิม

---

## 2026-10-19 คำสั่ง: /implement T-01 specs/014-manage-application-status/tasks.md

- ไฟล์ที่สร้าง/แก้: `.gitignore`, `requirements.txt`, `backend/app/main.py`, `backend/app/models/application_status.py`, `backend/app/middleware/auth.py`, `backend/db/schema.sql`, `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `backend/tests/test_AC_STA_01.py`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/pages/ApplicationStatusPage.jsx`, `frontend/src/api/client.js`, `specs/014-manage-application-status/tasks.md`
- ผล test: `python -m pytest -v backend/tests` ผ่าน 6 tests; `npm run build --prefix frontend` ผ่าน; `git diff --check` ผ่าน
- หมายเหตุ: test client แสดง deprecation warning จาก Starlette/httpx; ไม่มี test failure
- จุดที่ต้องกำหนดร่วมกับทีม: authentication จริงยังต้องเชื่อม trusted auth middleware ให้ตั้ง `request.state.student_id`; dependency ปฏิเสธโดยปริยายเมื่อไม่มี identity และไม่เชื่อ header ที่ผู้ใช้ควบคุม
- ขอบเขตสิ่งที่ทำ: อ่านข้อมูลรายละเอียดและปฏิเสธการเข้าถึงข้อมูลผู้อื่นเท่านั้น; ไม่เริ่ม task ถัดไป

---

## 2026-10-19 คำสั่ง: /tasks specs/008-vote-location/spec.md และ /tasks specs/014-manage-application-status/spec.md

- ตรวจทวน task breakdown ของทั้ง UC-08 และ UC-14 เทียบกับ spec, plan, Open Questions และกติกาใน AGENTS.md
- UC-08: 5 เฟส, 9 tasks; T-08 รอ Q-02 และ T-09 รอ Q-01
- UC-14: 5 เฟส, 8 tasks; T-08 รอ Q-01; T-01 เสร็จ รอทีมตรวจแล้ว
- ทุก AC และ Constraint ในสอง spec มี task อ้างอิง; ไม่เริ่ม implement task เพิ่ม

---

### แก้รอบที่ 3: เพิ่ม test ใน scope ของ T-01 UC-08

- ทีมอนุญาตให้เพิ่ม `backend/tests/test_vote_task_t01.py` ในไฟล์ที่แตะของ T-01
- เหตุผล: T-01 เป็นงานพื้นฐานไม่มี AC ตรง ๆ จึงต้องมี test ยืนยัน unique constraint และ secret ballot ตามกติกา implement

---

### Implement UC-08 T-01

- เพิ่ม model `VoteEligibility` และ `VoteBallot`; model ของบัตรลงคะแนนไม่มีข้อมูลผู้ลงคะแนน
- เพิ่ม `vote_eligibility` ที่บังคับ unique ต่อผู้ใช้/รอบ และ `vote_ballots` ที่แยกเก็บรอบ/สถานที่ โดยคง schema เดิมของ UC-14 ไว้
- เพิ่ม `backend/tests/test_vote_task_t01.py` ตรวจ required fields, secret ballot, unique constraint และ rollback ของ SQLite transaction
- ผลทดสอบ: `python -m pytest -v backend/tests/test_vote_task_t01.py` ผ่าน 3 tests; `python -m pytest -v backend/tests` ผ่าน 9 tests
- ตรวจ `git diff --check` ผ่าน
- สถานะ T-01: เสร็จ รอทีมตรวจ; ไม่เริ่ม task ถัดไป

---

## 2026-10-19 คำสั่ง: /testcases สำหรับ UC-08 และ UC-14

- AI ถามว่าจะทำ AC ใด; ผู้ใช้ตอบให้ทำทั้งสอง UC ที่กำหนดไว้และอนุญาตให้ปรับได้
- โหมด: ร่าง; ทุกแถวใหม่คงสถานะ “ร่าง” และยังไม่เขียน test code เพราะยังไม่มีแถวสถานะ “ใช้ได้”
- UC-08: เพิ่ม 12 แถว ครอบคลุม AC-VOT-01 ถึง AC-VOT-03 ใน `specs/008-vote-location/test-cases.md`
- UC-14: คง 9 แถวเดิมของ AC-STA-01 ตามเดิม และเพิ่ม 16 แถวครอบคลุม AC-STA-02 ถึง AC-STA-04 ใน `specs/014-manage-application-status/test-cases.md`
- บันทึกจุดที่ spec ยังไม่กำหนดผลลัพธ์เป็นคำถามในแถว test case; จุดที่ขึ้นกับ Q-01/Q-02 ระบุรอคำตอบ ไม่สร้าง assertion แทนทีม
- ผลทดสอบ: ไม่ได้รัน เพราะเป็นการร่าง test cases และไม่มี test code ใหม่

---

## 2026-10-19 คำสั่ง: /testcases AC-VOT-01 specs/008-vote-location

- ตรวจแล้วว่า `TC-VOT-01-1` เป็น “ใช้ได้”; แถวอื่นของ AC-VOT-01 ยังเป็น “ร่าง”
- ตกลง API เบื้องต้นสำหรับ test: `POST /api/votes` รับ `round_id` และ `location_id`; เมื่อสำเร็จตอบ HTTP 200 พร้อม `total_votes` และ `has_voted`
- ยังไม่เขียนหรือรัน test: T-02 ซึ่งสร้าง API ยังไม่ถูก implement และยังไม่ทราบแหล่งสิทธิ์ Role `lecturer`/`committee`; ตาราง `user_permissions` ปัจจุบันไม่มี Role `lecturer`
- ประเด็นค้างให้ทีมกำหนด: UC-08 จะอ่าน Role จากตารางใด/ปรับ schema อย่างไร และ API จะรับ trusted authenticated identity ผ่าน boundary ใด; ห้ามใช้ user ID จาก request body เพื่อผูกตัวตนกับ ballot

---

## 2026-10-19 คำสั่ง: ทำให้ test AC-VOT-01 ทดสอบได้

- ผู้ใช้อนุมัติให้ implement T-02 พร้อมแนวทางตารางสิทธิ์ UC-08 และ trusted authentication boundary
- ปรับรายการไฟล์ของ T-02 ใน `specs/008-vote-location/tasks.md` เพิ่ม `backend/app/main.py` และ `backend/db/schema.sql` เพราะต้อง mount API และสร้างตาราง Role ของรอบลงคะแนน
- สัญญา API ที่ทีมเลือก: `POST /api/votes` รับ `round_id` และ `location_id`; ตอบ HTTP 200 พร้อม `total_votes` และ `has_voted`
- เพิ่ม `vote_eligible_users` แยก Role `lecturer`/`committee` ต่อรอบ; ระบบอ่านตัวตนจาก `request.state.user_id` ที่ trusted middleware ต้องจัดให้; request body ไม่รับ user ID
- เพิ่ม API และ service ให้บันทึกสถานะการใช้สิทธิ์แยกจาก ballot ภายใน SQLite transaction; ตาราง ballot ไม่มีคอลัมน์ผู้ลงคะแนน และ API คืนยอดรวมที่อัปเดต
- เพิ่ม `test_TC_VOT_01_1_api_records_vote_and_updates_total` ตามแถวที่ทีมเปลี่ยนเป็น “ใช้ได้”
- ผลทดสอบ: `python -m pytest -v backend/tests/test_AC_VOT_01.py` ผ่าน 1 test; `python -m pytest -v backend/tests` ผ่าน 10 tests; `git diff --check` ผ่าน
- หมายเหตุให้ทีมตรวจ: การเชื่อมระบบกลางจริงยังต้องให้ trusted authentication middleware กำหนด `request.state.user_id`; boundary นี้ปฏิเสธคำขอเมื่อไม่มี identity และ test ใช้ dependency override สำหรับ identity ที่เชื่อถือแล้ว
- สถานะ T-02: เสร็จ รอทีมตรวจ; ไม่เริ่ม task ถัดไป

---

## 2026-10-19 คำสั่ง: /verify specs/008-vote-location และ specs/014-manage-application-status

- โหมดตรวจเท่านั้น; ไม่แก้โค้ด, test, spec, plan hoặc tasks
- รันทดสอบ: `cd backend && pytest -v` เก็บ test ไม่สำเร็จเพราะ `ModuleNotFoundError: No module named 'backend'` จำนวน 5 collection errors; รัน fallback `python -m pytest -v backend/tests` จาก repo root ผ่าน 10 tests
- Frontend: `cd frontend && npm test` ไม่สามารถรันได้เพราะ `frontend/package.json` ไม่มี script `test`
- UC-08: ตาราง RTM มี 12 requirement rows: ครบ 2, ยังไม่ถึง 8, รอ Q-02 1, ช่องโหว่ 1; findings ใหม่ F-01 ถึง F-02
- UC-14: ตาราง RTM มี 9 requirement rows: ครบ 0, ยังไม่ถึง 5, รอ Q-01 1, ช่องโหว่ 3; findings ใหม่ F-01 ถึง F-03
- สรุปข้อค้นพบ: UC-08 ยังไม่มีการยืนยัน p95 และตั้ง lock timeout 5 วินาทีซึ่งอาจเกิน NFR 2 วินาที; UC-14 ไม่มี UI/performance tests และยังไม่มี auth middleware ที่เชื่อม identity จริงใน workspace
- สร้าง `specs/008-vote-location/rtm.md` และ `specs/014-manage-application-status/rtm.md`

---
