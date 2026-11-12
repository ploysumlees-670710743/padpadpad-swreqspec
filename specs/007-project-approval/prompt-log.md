# Prompt Log: UC-07

- 2026-11-09: ได้รับมอบหมายฟีเจอร์ 007 ใน Fork แยก Branch
- /tasks specs/007-project-approval/spec.md: tasks.md v1; T-01 พบ FR ID ซ้ำกันใน spec.md
- ตรวจ Stack จริงของ repo: FastAPI + React/Vite; SQLite ใช้ใน app/main.py แต่ระบบ enrollment อีกส่วนใช้ PostgreSQL
- /implement: สร้าง isolated UC-07 approval routes, SQLite service, in-app notifications, append-only audit และ React UI ตาม AC-07 ที่ไม่กำกวม
- /testcase AC-07: สร้าง test-cases.md และ backend/tests/test_AC_07.py
- /verify: ร่าง RTM; ยังมีข้อค้นพบเรื่อง Spec conflict และ Auth/Membership ที่ต้องให้ทีมตัดสิน
- ทีมเลือกเอง ไม่ได้มาจาก spec: การจัดเก็บและกลไก notification แบบ in-app ใน SQLite
- Q-07-01 multi-tier approval ยังเปิดอยู่; ไม่ทำเพิ่ม

## 2026-11-12: นำ fork เข้าสู่ branch ทีม
ผู้ใช้อนุญาตนำงาน UC-01/UC-07 มาใส่ feature/751-uc01-uc07 เพื่อทดสอบ ไม่รวมเข้า main; คงข้อกำหนด UC-07 และคำถามเดิมไว้โดยไม่ตัดสินแทนทีม ดูบันทึก docs/srs/UC01-UC07-team-branch-integration-20261112.md

12 พ.ย. 2026: ผู้ใช้ขอตรวจเอกสารเทียบโค้ด แก้ส่วนทดสอบปลอดภัย ตรวจ CI และสรุปสิ่งค้าง ห้ามแก้ main หรือเปิด PR; ผลอยู่ใน docs/srs/UC01-UC07-final-review-20261112.md
