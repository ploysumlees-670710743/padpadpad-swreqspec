# Prompt Log: UC-09 เข้าสู่ระบบ

- 2026-11-13 06:34 UTC: ตรวจ requirement feature 009-login ตาม /verify
- /verify: อ่าน spec.md, plan.md, tasks.md, AGENTS.md และโค้ดที่เกี่ยวข้องทั้งหมดใน backend/app/, frontend/src/, backend/tests/, frontend/src/__tests__
- /verify: รัน `cd backend && pytest -v` ผล: 27 errors during collection; สาเหตุหลักคือ environment ขาด dependency `fastapi` และ `psycopg`
- /verify: รัน `cd frontend && npm test -- --watch=false` ผล: Frontend 16 ผ่าน, 13 ไม่ผ่าน (failures จาก feature อื่นของ repo เช่น schedule/vote; ไม่มี login failure ใน output ที่ระบุ)
- /verify: ตรวจ requirement-to-code สำหรับ UC-09 พบข้อค้นพบใหม่ F-01, F-02, F-03
- ข้อค้นพบ F-01: model `UserAccount` ไม่ตรงกับ schema/login requirement (ต้องใช้ `username`, `password_hash`, `status`, `role`)
- ข้อค้นพบ F-02: session auth boundary ไม่เก็บ `role` และ mismatch signature ระหว่าง `bind_session_user` กับ login route
- ข้อค้นพบ F-03: backend tests ใช้ข้อความ generic `Authentication failed.` / `Account is not authorized.` แทนข้อความ spec อย่าง “ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง” และ “บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ”
- สรุปสถานะ: Login feature มี code/UI scaffold, แต่ยังเป็นช่องโหว่เนื่องจาก authenticaton/session flow และ schema mismatch ที่ทำให้ requirement หลักไม่สมบูรณ์

- 2026-11-13 06:48 UTC: ใช้คำสั่ง /testcases สำหรับ AC-LOG-01 ใน specs/009-login
- โหมด: ร่าง (ยังไม่มี test-cases.md สำหรับ feature นี้)
- เสนอ TC ID: TC-LOG-01-1, TC-LOG-01-2, TC-LOG-01-3
- ผล: ยังไม่เขียนโค้ด test เพราะแถวยังอยู่ในสถานะ “ร่าง” และต้องให้ทีมตรวจ/แก้สถานะเป็น “ใช้ได้” ก่อน

- 2026-11-13 06:57 UTC: ตรวจซ้ำกับ AC-LOG-01 หลังสถานะใน [specs/009-login/test-cases.md](./test-cases.md) ถูกปรับเป็น “ใช้ได้”
- โหมด: เขียน test
- TC ID: TC-LOG-01-1, TC-LOG-01-2, TC-LOG-01-3
- ผล: ไม่มีการเพิ่ม test ใหม่เพราะแถวที่ “ใช้ได้” นี้มี test ที่ตรงแล้วในโค้ดอยู่แล้ว; รันตรวจจริง: frontend ผ่าน 3/3; backend ไม่สามารถรันได้เพราะ environment ขาด dependency `fastapi` สำหรับ `pytest` collection

- 2026-11-13 07:18 UTC: รันคำสั่ง /testcases สำหรับ AC-LOG-01 specs/009-login ตามสาขา testcases
- โหมด: เขียน test (เงื่อนไข “ใช้ได้” 已ครบ)
- TC ID: TC-LOG-01-1, TC-LOG-01-2, TC-LOG-01-3
- ผล: ตาราง [specs/009-login/test-cases.md](./test-cases.md) มีแถวราย AC ในสถานะ “ใช้ได้”; โค้ด test ที่ตรงตาม AC-LOG-01 มีอยู่แล้วใน `backend/tests/test_AC_LOG_01.py` และ `frontend/src/__tests__/AC_LOG_01.test.jsx` จึงไม่ต้องเพิ่ม test ใหม่หรือแก้ระบบ
- ผลตรวจล่าสุด: `cd /workspaces/padpadpad-swreqspec/backend && pytest -q tests/test_applicant_permissions.py tests/test_login_authentication_service.py tests/test_login_schema_foundation.py tests/test_AC_LOG_01.py` => 7 passed, 0 failed

- 2026-11-13 07:19 UTC: ใช้คำสั่ง /testcases สำหรับ AC-LOG-02 specs/009-login
- โหมด: ร่าง (ยังไม่มีแถวของ AC-LOG-02 ใน test-cases.md)
- TC ID ที่เสนอ: TC-LOG-02-1, TC-LOG-02-2, TC-LOG-02-3
- ผล: เพิ่ม 3 แถวในสถานะ “ร่าง”; task T-05 และ T-06 ที่ตรวจด้วย AC-LOG-02 ระบุสถานะ “เสร็จ”; ยังไม่เขียนหรือรัน test ตามโหมดร่าง
- ส่วนที่ spec ไม่ได้บอก: ผลที่คาดเมื่อผู้ใช้งานไม่ได้อยู่ที่หน้าเข้าสู่ระบบแต่พยายามส่งข้อมูลเข้าสู่ระบบ (TC-LOG-02-3)

- 2026-11-13 07:28 UTC: ใช้คำสั่ง /testcases สำหรับ AC-LOG-02 specs/009-login
- โหมด: เขียน test; TC-LOG-02-1 และ TC-LOG-02-2 เป็น “ใช้ได้” และยังไม่มี test ตามชื่อที่ระบุ; TC-LOG-02-3 ตรวจด้วยคน
- TC ID ที่เขียน: TC-LOG-02-1, TC-LOG-02-2 (เพิ่ม test API 2 ตัวใน `backend/tests/test_AC_LOG_02.py` และ test UI 2 ตัวใน `frontend/src/__tests__/AC_LOG_02.test.jsx`)
- ผล targeted tests: `cd backend && pytest -v tests/test_AC_LOG_02.py` => 3 passed; `cd frontend && npm test -- --run src/__tests__/AC_LOG_02.test.jsx` => 3 passed
- ผล full suites: `cd backend && pytest -v` => 105 passed, 27 failed; `cd frontend && npm test` => 37 passed, 13 failed; รายการที่ล้มเหลวอยู่ใน feature อื่น ไม่ใช่ tests ของ AC-LOG-02
- TC-LOG-02-3 ไม่ได้เขียนโค้ด test เพราะเป็นกรณีที่ spec ไม่ได้บอกผลคาดหวัง; ต้องให้ทีมตัดสิน expected result ก่อน

- 2026-11-13 07:31 UTC: ใช้คำสั่ง /testcases สำหรับ AC-LOG-03 specs/009-login
- โหมด: ร่าง (ยังไม่มีแถวของ AC-LOG-03 ใน test-cases.md)
- TC ID ที่เสนอ: TC-LOG-03-1, TC-LOG-03-2, TC-LOG-03-3
- ผล: เพิ่ม 3 แถวในสถานะ “ร่าง”; task T-07 และ T-08 ที่ตรวจด้วย AC-LOG-03 ระบุสถานะ “เสร็จ”; ยังไม่เขียนหรือรัน test ตามโหมดร่าง
- ส่วนที่ spec ไม่ได้บอก: ไม่มี; กรณีทางผิดใช้ AC-LOG-01 และ FR-LOG-05 เป็นผลที่คาดหวังเมื่อบัญชี Active และ role ได้รับอนุญาต

- 2026-11-13 07:39 UTC: ใช้คำสั่ง /testcases สำหรับ AC-LOG-03 specs/009-login หลังทีมเปลี่ยนแถวเป็น “ใช้ได้”
- โหมด: เขียน test; เขียน TC-LOG-03-1, TC-LOG-03-2, TC-LOG-03-3 (เพิ่ม API test 3 ตัวใน `backend/tests/test_AC_LOG_03.py` และ UI test 3 ตัวใน `frontend/src/__tests__/AC_LOG_03.test.jsx`)
- ผล targeted tests: `cd backend && pytest -v tests/test_AC_LOG_03.py` => 4 passed; `cd frontend && npm test -- --run src/__tests__/AC_LOG_03.test.jsx` => 4 passed
- ผล full suites: `cd backend && pytest -v` => 108 passed, 27 failed; `cd frontend && npm test` => 40 passed, 13 failed; failures อยู่ใน feature อื่น ไม่ใช่ tests ของ AC-LOG-03
- ผลราย TC: TC-LOG-03-1 ผ่าน, TC-LOG-03-2 ผ่าน, TC-LOG-03-3 ผ่าน ทั้ง API และ UI; `git diff --check` ผ่าน

- 2026-11-13 07:40 UTC: ใช้คำสั่ง /verify สำหรับ specs/009-login
- ผล test เต็ม: `cd backend && pytest -v` => 108 passed, 27 failed; `cd frontend && npm test` => 40 passed, 13 failed; tests ของ UC-09 ที่แสดงในผลรันผ่านทั้งหมด ส่วน failures อยู่ใน feature REG/SCH/ENR/VOT
- ตารางตามรอยไปข้างหน้า: 13 แถว — ครบ 6, ยังไม่ถึง 0, รอ Q 0, ช่องโหว่ 7
- ข้อค้นพบใหม่: F-04 ถึง F-09; F-01 ถึง F-03 ย้ายไป “แก้แล้ว” หลังยืนยันกับโค้ดและ tests ปัจจุบัน
- แก้ไขเฉพาะ `rtm.md` และเพิ่มบันทึกนี้ต่อท้าย; ไม่แก้ code, tests, spec, plan หรือ tasks
