# Tasks: UC-01 บันทึกข้อมูลสถานที่และชุมชน

อ้างอิง: [spec.md](./spec.md) (Draft v2), [plan.md](./plan.md)
สถานะ: Draft v1 — มี Prototype/API และ scoped CI tests ผ่านแล้วใน Fork; งาน Integration, full tests และคำถามเปิดยังต้องตรวจยืนยันกับทีม

## งานที่ทำได้ทันที (ไม่พึ่งพา Task อื่น)

- [ ] **T-01 — ตรวจสอบสัญญาข้อมูลและ API จาก Spec** (FR-01-02 ถึง FR-01-05, AC-01, C-01, C-02)
  - ตรวจและบันทึก field ที่ระบุใน Spec: ชื่อชุมชน, ชื่อผู้ดูแล, ตำแหน่ง, เบอร์โทร, local rules, สถานที่ค่าย
  - ยืนยันการเชื่อมโยง location_id และการตรวจสิทธิ์ค่ายที่ได้รับมอบหมาย
  - เกณฑ์ผ่าน: mapping field → FR/AC/C ครบ; ไม่เพิ่มกฎตรวจเบอร์หรือชื่อซ้ำเอง
  - ไฟล์ที่เกี่ยวข้อง: spec.md, plan.md; ไม่แก้ไฟล์ฟีเจอร์อื่น

## งาน Implement (เริ่มหลังยืนยัน Stack และสัญญาข้อมูลร่วม)

- [ ] **T-02 — Data model และ persistence** (FR-01-02 ถึง FR-01-05, AC-01)
  - ขึ้นกับ: T-01, การเลือก DB/ORM ของทีม และ Location model ที่ใช้อยู่
  - เกณฑ์ผ่าน: บันทึกข้อมูล Community ที่ผูก Location ได้จริง
- [ ] **T-03 — Backend POST /api/communities** (FR-01-03 ถึง FR-01-05, AF-01-01, AC-01, C-01)
  - ขึ้นกับ: T-02, ระบบ Authentication/Assignment ของทีม
  - เกณฑ์ผ่าน: ข้อมูลจำเป็นครบแล้วบันทึกสำเร็จ; ขาดข้อมูลสำคัญไม่บันทึก; ไม่มีสิทธิ์ข้ามค่าย
- [ ] **T-04 — Backend GET /api/locations/{id}/communities** (FR-01-01, FR-01-02, C-01)
  - ขึ้นกับ: T-02, นโยบายการอ่านข้อมูลของทีม
  - เกณฑ์ผ่าน: แสดงข้อมูลของสถานที่ตามสิทธิ์ที่ตกลงไว้
- [ ] **T-05 — Frontend form และรายการชุมชน** (FR-01-01 ถึง FR-01-05, AF-01-01, AC-01, QR-02)
  - ขึ้นกับ: T-03, T-04, Frontend stack ของทีม
  - เกณฑ์ผ่าน: กรอกและบันทึกสำเร็จพร้อมข้อความยืนยัน; ข้อมูลไม่ครบแสดงข้อผิดพลาด
- [ ] **T-06 — Testcases, pytest และ verify** (AC-01, C-01, C-02, QR-01, QR-02)
  - ขึ้นกับ: T-03 ถึง T-05
  - เกณฑ์ผ่าน: ทดสอบ AC-01, validation, cross-camp authorization และ response time 2 วินาที; บันทึกผลจริงก่อนติ๊กเสร็จ

## รอคำตอบ ไม่อนุญาตให้เดา

- **Q-01-01:** ต้องตรวจรูปแบบเบอร์โทรและชื่อชุมชนซ้ำหรือไม่
- **Q-01-02:** รองรับเอกสาร/รูปภาพแนบหรือไม่ (ตอนนี้ C-02 ระบุ Text เป็นหลัก)
- **TECH-DECISION (ทีมเลือกเอง ไม่ได้มาจาก spec):** ภาษา Backend, Framework, DB/ORM, Frontend และวิธีผูก Authentication/Location assignment ยังไม่ระบุใน Constraints
- ยังไม่อ้างว่า pytest หรือ /verify ผ่านจนกว่าจะมีการรันจริง

## Traceability

| AC / Constraint | Tasks |
|---|---|
| AC-01 | T-01, T-02, T-03, T-05, T-06 |
| C-01 | T-01, T-03, T-04, T-06 |
| C-02 | T-01, T-05, T-06 |
| FR-01-01 ถึง FR-01-05 | T-01 ถึง T-05 |
| AF-01-01 | T-03, T-05, T-06 |
| QR-01, QR-02 | T-05, T-06 |

## ความคืบหน้าใน Fork (11 พ.ย. 2026 — ยังไม่ใช่การอนุมัติจากทีม)

- T-02/T-03/T-04: มี SQLite persistence, POST/PUT/GET communities และ GET `/api/locations/assigned` ที่กรองตามผู้ใช้ซึ่งผ่านการยืนยันตัวตน; ยังรอเชื่อม UC-09 และข้อมูล assignment จริง
- T-05: มี React form สำหรับเลือกสถานที่ที่มอบหมาย บันทึก/แก้ไขชุมชน และแสดงข้อผิดพลาด; Demo Mode ใช้ข้อมูลจำลอง
- T-06: CI [run 43025058889](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43025058889) ทดสอบ Backend เฉพาะ UC-01/07 17 cases และ Offline Demo 11 cases ผ่าน พร้อม Build ผ่าน; **ยังไม่มี full repo pytest, browser E2E, performance 2 วินาที และ usability verification**
- คงรายการ checkbox เดิมไว้เพื่อรอคนตรวจ end-to-end ตามเกณฑ์ “เสร็จเมื่อ”; ดูช่องโหว่ใน [rtm.md](./rtm.md)
