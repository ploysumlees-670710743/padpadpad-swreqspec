# Tasks: UC-07 พิจารณาและอนุมัติโครงการ

อ้างอิง: [spec.md](./spec.md) (Draft v2), [plan.md](./plan.md)
สถานะ: Draft v1 — มี Prototype/API และ scoped CI tests ผ่านแล้วใน Fork; ยังมี Spec conflict, Integration และ full tests ที่ต้องให้ทีมตรวจ

## งานที่ทำได้ทันที (ไม่พึ่งพา Task อื่น)

- [ ] **T-01 — ตรวจสอบ FR ซ้ำและขัดแย้ง** (AC-07, C-01, C-02)
  - spec.md มีหัวข้อ Functional Requirements สองชุด โดย FR-07-01 ถึง FR-07-05 ถูกใช้ซ้ำด้วยความหมายต่างกัน
  - ส่งให้ทีมยืนยันว่าจะใช้ชุดใด ห้ามเปลี่ยน ID เองตาม AGENTS.md
  - เกณฑ์ผ่าน: ได้ Spec ที่ไม่กำกวมและ Traceability สอดคล้องกันก่อน Implement

## งาน Implement (รอ T-01 และการยืนยัน Stack)

- [ ] **T-02 — Approval model, state transitions และ audit history** (AC-07, C-02, QR-02)
  - ขึ้นกับ: T-01, DB/ORM ของทีม และ Project model
  - เกณฑ์ผ่าน: เก็บสถานะ/เหตุผล/ผู้พิจารณา/เวลา และ history แบบไม่แก้ย้อนหลัง
- [ ] **T-03 — POST /api/projects/{id}/approval** (AC-07, C-01, QR-01)
  - ขึ้นกับ: T-02, ระบบ Login และสิทธิ์อาจารย์ที่ปรึกษาของโครงการ
  - เกณฑ์ผ่าน: เฉพาะอาจารย์ที่ปรึกษาที่มีสิทธิ์ตัดสินผลได้
- [ ] **T-04 — Revision, rejection และ notification** (AF-07-01, AF-07-02, AC-07, C-02)
  - ขึ้นกับ: T-02, T-03 และกลไกแจ้งเตือนของทีม
  - เกณฑ์ผ่าน: ส่งกลับแก้ไขพร้อมเหตุผลและส่งซ้ำได้; ไม่อนุมัติบันทึกเหตุผลและยุติขั้นตอน; แจ้งสถานะคณะกรรมการ
- [ ] **T-05 — Frontend หน้าพิจารณาและสถานะโครงการ** (AC-07, QR-01)
  - ขึ้นกับ: T-03, T-04, Frontend stack ของทีม
  - เกณฑ์ผ่าน: อาจารย์ดูข้อมูลและเลือกผลได้; คณะกรรมการเห็นสถานะ; อาจารย์ไม่แก้เนื้อหาโครงการโดยตรง
- [ ] **T-06 — Testcases, pytest และ verify** (AC-07, C-01, C-02, QR-01, QR-02)
  - ขึ้นกับ: T-03 ถึง T-05
  - เกณฑ์ผ่าน: ทดสอบอนุมัติ/ไม่อนุมัติ/ส่งแก้ไข, unauthorized approval, audit history, การส่งซ้ำ และการแจ้งเตือน; บันทึกผลจริง

## รอคำตอบ ไม่อนุญาตให้เดา

- **SPEC-CONFLICT:** Functional Requirements สองชุดใช้ ID เดียวกันคนละความหมาย; ให้เจ้าของ Spec/ทีมตัดสิน
- **Q-07-01:** ต้องรองรับการอนุมัติหลายระดับหรือไม่ (ไม่เพิ่มจนกว่าจะยืนยัน)
- **TECH-DECISION (ทีมเลือกเอง ไม่ได้มาจาก spec):** ภาษา Backend, Framework, DB/ORM, Frontend, Auth และ Notification transport ยังไม่ระบุใน Constraints
- ยังไม่อ้างว่า pytest หรือ /verify ผ่านจนกว่าจะรันจริง

## Traceability

| AC / Constraint | Tasks |
|---|---|
| AC-07 | T-01 ถึง T-06 |
| C-01 | T-03, T-06 |
| C-02 | T-02, T-04, T-06 |
| AF-07-01, AF-07-02 | T-04, T-06 |
| QR-01 | T-03, T-05, T-06 |
| QR-02 | T-02, T-06 |
| FR-07-* | รอ T-01 ยืนยันชุด ID ก่อน Mapping |

## ความคืบหน้าใน Fork (11 พ.ย. 2026 — ยังไม่ใช่การอนุมัติจากทีม)

- T-02/T-03/T-04: มี status transitions, approval history แบบ immutable, notifications ในแอป และ API สำหรับส่ง/พิจารณาโครงการ
- T-05: มีหน้า React สำหรับส่ง/พิจารณาและดูสถานะ; ปรับไม่ให้ข้อมูลโครงการก่อนหน้าค้าง และดึงรายการแจ้งเตือนใหม่หลังบันทึกผล แต่ยังไม่มีหน้าเอกสารโครงการฉบับเต็ม
- T-06: CI [run 43025058889](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43025058889) ทดสอบ Backend เฉพาะ UC-01/07 17 cases และ Offline Demo 11 cases ผ่าน พร้อม Build ผ่าน; **ยังไม่ได้เชื่อม UC-09 Auth จริง, full repo pytest หรือ browser E2E**
- T-01 ยังเป็น **BLOCKER**: ID FR-07-01..05 ซ้ำความหมายต่างกันใน spec.md; ห้ามแก้หรือเลือกชุด ID เองก่อนทีมยืนยัน
- คงรายการ checkbox เดิมไว้เพื่อรอคนตรวจ end-to-end ตามเกณฑ์ “เสร็จเมื่อ”; ดูช่องโหว่ใน [rtm.md](./rtm.md)

## สถานะทบทวน 12 พ.ย. 2026 (ใช้แทนข้อความสถานะปัจจุบันในบันทึกเก่าด้านบน)

ตรวจใน branch ทีม feature/751-uc01-uc07 แล้ว ดู [ผลตรวจรวม](../../docs/srs/UC01-UC07-final-review-20261112.md) สำหรับสิ่งที่ครบและยังขาด บันทึกผล Fork ด้านบนเป็นประวัติ ไม่ใช่ผลปัจจุบัน
มี component tests ใหม่ใน frontend/src/__tests__/uc01_uc07_ui.test.jsx ผ่านสองข้อ (UC-01 บันทึกและข้อความยืนยัน; UC-07 ซ่อนปุ่มอาจารย์จาก committee) และ prototype contract ผ่าน 11 ข้อ; ยังไม่มี Browser E2E หรือ Auth จริง จึงคงสถานะ acceptance ที่ยังไม่ครบไว้
ผล backend ใช้ Actions ของ branch ทีม; ไม่สรุป full suite ผ่านจากชื่อ job สีเขียวเมื่อเป็น non-gating ให้ดูผล diagnostic/counts ในรอบล่าสุด
