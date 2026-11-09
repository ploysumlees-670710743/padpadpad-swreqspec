# Prompt Log

## /implement T-03 — UC-08 Vote Location

- คำสั่ง: `/implement T-03 specs/008-vote-location/tasks.md`
- การตัดสินใจจากทีม: อนุมัติ contract ชั่วคราว `GET /api/votes/locations?round_id=...` ซึ่งคืน `{round_id, locations:[{location_id,name,image_url,survey_summary,total_votes}]}` และต้องอัปเดตยอดที่เปลี่ยนจากผู้ใช้อื่นด้วย
- แนวทางเดิม: ใช้ polling ทุก 5 วินาทีจากหน้า frontend; component รับ `roundId` จากผู้เรียก (ภายหลังเปลี่ยนเป็นข้อมูลจำลองตามคำขอทีมในหัวข้อถัดไป)
- ไฟล์ที่สร้างหรือแก้:
  - `frontend/src/pages/VoteLocationPage.jsx`
  - `frontend/src/api/client.js`
  - `frontend/src/__tests__/test_AC_VOT_01.test.jsx`
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `specs/008-vote-location/tasks.md`
  - `prompt-log.md`
- ผลตรวจ: `npm --prefix frontend test` ผ่าน 5 tests ใน 4 test files; `npm --prefix frontend run build` ผ่าน
- ประเด็นที่ถามทีมแทนการกำหนดเอง: แหล่ง/รูปแบบข้อมูลสถานที่และ API รายการคะแนน, วิธีอัปเดตคะแนนของผู้ใช้อื่น และการเพิ่ม test dependencies นอกไฟล์ที่ระบุใน task
- ขอบเขตที่ยังต้องเชื่อมภายหลัง: backend ยังไม่มี `GET /api/votes/locations`; T-03 ทดสอบ frontend ด้วย mock API ตาม contract ชั่วคราวที่ทีมอนุมัติ ไม่ได้ปิด Q-02 หรือทำ end-to-end integration

## ปรับเป็น prototype ข้อมูลจำลอง

- คำขอ: เปลี่ยนหน้าโหวตให้เป็น prototype ที่ใช้ข้อมูลจำลองและเปิดสาธิตจากแอปได้ โดยผู้ใช้อนุญาตให้แก้ `frontend/src/main.jsx`
- ไฟล์ที่แก้เพิ่มเติม:
  - `frontend/src/api/client.js`
  - `frontend/src/pages/VoteLocationPage.jsx`
  - `frontend/src/__tests__/test_AC_VOT_01.test.jsx`
  - `frontend/src/main.jsx`
- พฤติกรรม prototype: แสดงสถานที่ตัวอย่าง 3 รายการพร้อมภาพ SVG ในตัวอย่าง, สรุปผลสำรวจ และยอดคะแนน; ยืนยันแล้วเพิ่มคะแนนในหน่วยความจำและแสดงว่าใช้สิทธิ์แล้ว
- ข้อจำกัดที่แสดงใน UI: ข้อมูลเป็นตัวอย่าง ไม่บันทึกลงระบบจริง; รีโหลดหน้าแล้วข้อมูลและคะแนนกลับสู่ค่าเริ่มต้น; ไม่มีการซิงก์คะแนนจาก browser/user อื่น
- หมายเหตุ: `GET /api/votes/locations` และ `POST /api/votes` ไม่ถูกเรียกจากหน้าต้นแบบนี้; backend จริงไม่ได้เปลี่ยน

## /implement T-04 — AC-VOT-02

- คำสั่ง: `/implement T-04 specs/008-vote-location/tasks.md`
- ไฟล์ที่สร้าง: `backend/tests/test_AC_VOT_02.py`
- ไฟล์ที่ตรวจแล้วไม่ต้องแก้: `backend/app/services/vote_service.py` ปฏิเสธผู้ที่มีสถานะใช้สิทธิ์แล้วภายใน transaction; `backend/app/api/votes.py` แปลง `AlreadyVotedError` เป็น HTTP 409 พร้อมข้อความตาม spec
- ผลทดสอบ: `PYTHONPATH=. pytest -q backend/tests/test_AC_VOT_02.py backend/tests/test_AC_VOT_01.py` — 2 passed
- หมายเหตุการรัน: คำสั่ง pytest รอบแรกที่ไม่มี `PYTHONPATH=.` เก็บ test ไม่สำเร็จเพราะ import package `backend` ไม่พบ; รันใหม่โดยกำหนด import path แล้วผ่าน
- สิ่งที่เกือบต้องเดา: ไม่มี; ใช้ข้อความและพฤติกรรมที่ระบุใน AC-VOT-02 โดยตรง

## /implement T-05 — AC-VOT-02

- คำสั่ง: `/implement T-05 specs/008-vote-location/tasks.md`
- ไฟล์ที่สร้าง: `frontend/src/__tests__/test_AC_VOT_02.test.jsx`
- ไฟล์ที่ตรวจแล้วไม่ต้องแก้: `frontend/src/pages/VoteLocationPage.jsx` disable ตัวเลือกและปุ่มยืนยันหลังโหวต พร้อมแสดงข้อความ “ท่านได้ใช้สิทธิ์ไปแล้ว”; `frontend/src/api/client.js` ปฏิเสธการโหวตซ้ำใน prototype state
- ผลทดสอบ: `npm --prefix frontend test` — 6 passed ใน 5 test files; `npm --prefix frontend run build` — ผ่าน
- สิ่งที่เกือบต้องเดา: ไม่มี; ข้อความและพฤติกรรมอ้าง AC-VOT-02/FR-VOT-06 โดยตรง

## /implement T-06 — AC-VOT-03

- คำสั่ง: `/implement T-06 specs/008-vote-location/tasks.md`
- ไฟล์ที่สร้างหรือแก้:
  - `backend/app/middleware/authz.py`
  - `backend/app/api/votes.py`
  - `backend/tests/test_AC_VOT_03.py`
  - `specs/008-vote-location/tasks.md`
  - `prompt-log.md`
- ผลทดสอบ: `PYTHONPATH=. pytest -q backend/tests/test_AC_VOT_03.py backend/tests/test_AC_VOT_01.py backend/tests/test_AC_VOT_02.py` — 4 passed; `python -m compileall -q backend/app/middleware/authz.py backend/app/api/votes.py backend/tests/test_AC_VOT_03.py` — ผ่าน
- การบังคับ constraint: `authz.py` ปฏิเสธเมื่อ trusted identity ไม่มี โดยตอบ HTTP 503 และข้อความตาม CON-SEC-01; role ต่อรอบตรวจใน `VoteService.cast_vote` และ API แปลง `IneligibleVoterError` เป็น HTTP 403 ตาม FR-VOT-02/AC-VOT-03
- สิ่งที่เกือบต้องเดา: ไม่มี; ผู้ใช้ไม่มีสิทธิ์แทนด้วยผู้ใช้ที่มี committee role ในรอบอื่นแต่ไม่มี role ในรอบที่ขอโหวต เพื่อทดสอบ scope ตาม FR-VOT-02

## /implement T-07 — AC-VOT-03

- คำสั่ง: `/implement T-07 specs/008-vote-location/tasks.md`
- การตัดสินใจจากทีม: ใช้ mock client API ส่ง role/status ให้ UI; ค่า prototype ปกติเป็น role `lecturer`
- ไฟล์ที่แก้หรือสร้าง:
  - `frontend/src/pages/VoteLocationPage.jsx`
  - `frontend/src/api/client.js`
  - `frontend/src/__tests__/test_AC_VOT_03.test.jsx`
  - `specs/008-vote-location/tasks.md`
  - `prompt-log.md`
- ผลทดสอบ: `npm --prefix frontend test` — 8 passed ใน 6 test files; `npm --prefix frontend run build` — ผ่าน
- การรองรับข้อกำหนด: หน้าซ่อน radio และปุ่มยืนยันเมื่อ role ไม่ใช่ lecturer/committee ตาม FR-VOT-02/AC-VOT-03; กรณี client แจ้ง auth failure แสดงข้อความ “ระบบยืนยันตัวตนขัดข้อง” ตาม CON-SEC-01
- ข้อจำกัด prototype: role เริ่มต้นจาก mock client ไม่ใช่ระบบยืนยันตัวตนจริง; backend ยังคงเป็นผู้ตรวจ role จริงใน API
- สิ่งที่เกือบต้องเดา: แหล่ง role/auth state ไม่มีใน prototype เดิม จึงถามทีมและได้รับคำตอบให้ทำ mock client แทนการเพิ่มตัวเลือกเปลี่ยน role ใน UI

## คำตอบทีมสำหรับ UC-08 Q-02 — Prototype

- วันที่: 2026-11-09
- คำตอบทีม: prototype ใช้ข้อมูลจำลอง โดยข้อมูลแต่ละสถานที่มีชื่อ รูปภาพ และสรุปผลสำรวจ
- บันทึกใน `specs/008-vote-location/spec.md` ใต้ Q-02 โดยคง ID เดิม; การเชื่อมแหล่งข้อมูลจริงระบุว่าอยู่นอกขอบเขต prototype
- ปรับ plan และ test case TC-VOT-01-2 ให้สอดคล้องกับขอบเขต prototype; แถว test case ยังคงสถานะ “ร่าง” จนกว่าทีมจะตรวจ
- T-08 ยังรอข้อสรุปแหล่งข้อมูลจริง แต่ไม่บล็อก prototype

## ปรับรูปแบบหน้า UC-08 — Green Theme

- คำขอ: จัดหน้า “ลงคะแนนสถานที่ค่าย” ให้เป็น Green Theme รองรับมือถือและเดสก์ท็อป พร้อม Card, สถานะที่เลือก และ Badge คะแนนรวม
- ไฟล์ที่แก้:
  - `frontend/src/pages/VoteLocationPage.jsx`
  - `frontend/src/pages/VoteLocationPage.css`
- แนวทาง: ใช้ CSS แบบ scoped กับหน้าโหวต, คงการเลือก/ยืนยันคะแนนตามเดิม, และเชื่อมการแสดงผลกับ FR-VOT-01, FR-VOT-03, FR-VOT-05 และ NFR-USE-01

## /implement T-08 — AC-VOT-01

- คำสั่ง: `/implement T-08 specs/008-vote-location/tasks.md`
- การตัดสินใจจากทีม: prototype ใช้ข้อมูลจำลอง; แหล่งข้อมูลจริงยังไม่กำหนดและอยู่นอกขอบเขต prototype
- ไฟล์ที่แก้หรือสร้าง:
  - `backend/app/services/vote_service.py`
  - `backend/app/api/votes.py`
  - `frontend/src/api/client.js`
  - `frontend/vite.config.js`
  - `backend/tests/test_AC_VOT_01_location_list.py`
  - `frontend/src/__tests__/test_AC_VOT_01.test.jsx`
  - `frontend/src/__tests__/test_AC_VOT_02.test.jsx` (เพิ่ม mock API สำหรับ regression test ตามที่ผู้ใช้อนุญาต)
  - `specs/008-vote-location/tasks.md`
  - `prompt-log.md`
- ผลทดสอบ: `npm --prefix frontend test` — 8 passed ใน 6 test files; `npm --prefix frontend run build` — ผ่าน; `PYTHONPATH=. pytest -q backend/tests/test_AC_VOT_01_location_list.py backend/tests/test_AC_VOT_01.py backend/tests/test_AC_VOT_02.py backend/tests/test_AC_VOT_03.py` — 5 passed; `git diff --check` — ผ่าน
- การรองรับข้อกำหนด: `VoteService.get_vote_locations` คืนรายการจำลองพร้อมชื่อ รูปภาพ สรุปผลสำรวจ และยอดคะแนนตาม FR-VOT-01/FR-VOT-05; `GET /api/votes/locations` ส่งข้อมูลผ่าน API และ Vite proxy เชื่อม frontend dev server กับ backend
- ขอบเขตต้นแบบ: การอ่านรายการเรียก mock API; การยืนยันคะแนนยังอัปเดตเฉพาะ in-memory state ใน client ไม่บันทึก backend และไม่เชื่อมข้อมูลสถานที่จริง
- สิ่งที่เกือบต้องเดา: แหล่งข้อมูลจริงไม่ระบุใน spec แต่ทีมยืนยันให้ใช้ข้อมูลจำลอง จึงทำ mock source แทนการสมมติแหล่งข้อมูลจริง

## /implement T-09 — แสดงผลกรณีคะแนนเสมอ

- คำสั่ง: `/implement T-09 specs/008-vote-location/tasks.md`
- การตัดสินใจจากทีม: เมื่อคะแนนสูงสุดเสมอกัน ให้แสดงสถานที่ที่คะแนนเสมอทั้งหมดและแจ้งให้คณะกรรมการตัดสินใจต่อ โดยระบบไม่เลือกผู้ชนะ; บันทึกปิด Q-01 ใน spec
- ไฟล์ที่แก้:
  - `backend/app/services/vote_service.py`
  - `frontend/src/pages/VoteLocationPage.jsx`
  - `frontend/src/__tests__/test_AC_VOT_01.test.jsx` (ได้รับอนุญาตให้เพิ่ม regression test สำหรับ T-09)
  - `specs/008-vote-location/spec.md`
  - `specs/008-vote-location/plan.md`
  - `specs/008-vote-location/tasks.md`
  - `prompt-log.md`
- ผลทดสอบ: `npm --prefix frontend test` — 9 passed ใน 6 test files; `npm --prefix frontend run build` — ผ่าน; `PYTHONPATH=. pytest -q backend/tests/test_AC_VOT_01_location_list.py backend/tests/test_AC_VOT_01.py backend/tests/test_AC_VOT_02.py backend/tests/test_AC_VOT_03.py` — 5 passed; `git diff --check` — ผ่าน
- การรองรับข้อกำหนด: `VoteService.get_vote_locations` เรียงคะแนนสูงสุดไว้ด้วยกันโดยไม่กำหนดผู้ชนะ; หน้าโหวตแสดงสถานที่ทั้งหมดที่คะแนนสูงสุดเสมอกัน พร้อมแจ้งให้คณะกรรมการตัดสินใจและระบุชัดว่าระบบไม่เลือกผู้ชนะ (FR-VOT-05)
- สิ่งที่เกือบต้องเดา: Q-01 ยังเปิดอยู่ใน spec ก่อนเริ่ม จึงขอคำตอบทีมก่อน; ใช้มติตามที่ทีมยืนยันและปรับ spec/plan ก่อน implement
