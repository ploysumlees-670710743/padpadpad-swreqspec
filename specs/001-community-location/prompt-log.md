# Prompt Log: UC-01

- 2026-11-09: ผู้ใช้สั่งให้ทำงานเฉพาะ Feature 001 และ 007 ใน Fork แยก Branch แล้วรวมงานกลับผ่าน PR ภายหลัง
- อ่าน specs/README.md, spec.md, plan.md, AGENTS.md, Backend/Frontend ที่มีอยู่และคู่มือคำสั่ง /tasks /implement /testcases /verify
- /tasks specs/001-community-location/spec.md: มี tasks.md v1 แล้ว; อ้าง FR, AF, AC, C, QR
- /implement: สร้าง UC-01 isolated SQLite service, authenticated FastAPI routes, React form; Tech choice เป็นการเลือกของทีม ไม่ใช่ข้อกำหนดจาก spec
- /testcase AC-01: สร้าง test-cases.md และ backend/tests/test_AC_01.py
- /verify: ร่าง RTM โดยยังไม่อ้างว่า test ผ่าน
- Open: Q-01-01, Q-01-02; UC09 auth integration; location-assignment provisioning; QR-01 performance verification

## 2026-11-12: นำ fork เข้าสู่ branch ทีม
ผู้ใช้: "ใส่ใส่ใส่ ทำให้ผมหน่อยสิ" — ให้นำงาน UC-01/UC-07 จาก fork มาใส่ feature/751-uc01-uc07 เพื่อทดสอบ โดยไม่รวมเข้า main
การดำเนินการ: รวมประวัติงาน แก้จุดชนหน้าเริ่มต้นโดยคงหน้าโหวตเดิมของทีม และแยกทางเข้า UC-01/UC-07; รายละเอียดผลตรวจอยู่ใน docs/srs/UC01-UC07-team-branch-integration-20261112.md

12 พ.ย. 2026: ผู้ใช้ขอตรวจเอกสารเทียบโค้ด แก้ส่วนทดสอบปลอดภัย ตรวจ CI และสรุปสิ่งค้าง ห้ามแก้ main หรือเปิด PR; ผลอยู่ใน docs/srs/UC01-UC07-final-review-20261112.md

## 2026-11-13 08:07 UTC: /verify specs/001-community-location/
- Backend full suite (`cd backend && pytest -v`): 108 passed, 27 failed, 1 warning; UC-01 `test_AC_01.py` ผ่าน 9 tests; failures อยู่ใน REG/SCH
- Frontend full suite (`cd frontend && npm test`): 40 passed, 13 failed จาก 53; `uc01_uc07_ui.test.jsx` ผ่าน 2 tests (UC-01 และ UC-07); failures อยู่ใน ENR/SCH/VOT; `vite.config.js` exclude offline prototype test file
- ตรวจ OpenAPI โดยไม่เริ่ม app lifespan: ทั้ง `backend.app.main:app` และ `backend.main:app` ไม่มี UC-01 community routes; พบ `backend/app/main.py` ประกาศ app ชุดที่สองทับ app แรก
- ตามรอยไปข้างหน้า: 11 แถว — ครบ 0, ยังไม่ถึง 0, รอ Q 0, ช่องโหว่ 11
- ข้อค้นพบใหม่ F-UC01-08 ถึง F-UC01-10; F-UC01-07 ย้ายไป “แก้แล้ว” หลังยืนยัน dropdown ใช้รายการ locations ที่ API filter ตาม assignment
- แก้เฉพาะ `rtm.md` และเพิ่มบันทึกนี้; ไม่แก้ code, tests, spec, plan หรือ tasks
