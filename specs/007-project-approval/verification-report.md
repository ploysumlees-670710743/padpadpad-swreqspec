# Verification Report — UC-07

**GitHub Actions ที่รันจริง:** [Verify UC-01 and UC-07 prototype — run 42601274738](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/42601274738) (9 พฤศจิกายน 2026)

## ผลที่ยืนยันด้วย CI บน Branch
- `python -m pytest -v backend/tests/test_AC_01.py backend/tests/test_AC_07.py`: **16 passed, 1 warning, 0 failed**
- UC-07: **8 tests ผ่าน** (3 decision types + unauthorized adviser + revision/resubmit/reject + audit immutability + missing reason + unauthenticated)
- `npm ci && npm run build` บน `frontend/`: **สำเร็จ**
- `/?feature=project-approval` routed from `frontend/src/main.jsx`
- `VITE_DEMO_MODE=true` allows preview without auth/backend but is explicitly labeled mock

## ยังไม่ผ่านการ Verify ครบ
- **Spec conflict:** FR-07-01..05 ถูกใช้ซ้ำด้วยความหมายไม่ตรงกันหลัง Traceability; รอทีมแก้ต้นฉบับ
- UC-09 Authentication และ project/adviser membership ยังไม่ integrate
- หน้าตรวจเอกสารเสนอโครงการฉบับเต็มยังไม่มี
- UI notification ยังไม่ refresh แบบอัตโนมัติ; tests ผ่านเฉพาะ feature-specific API
- ยังไม่รัน full repo pytest หรือ browser E2E
- ดูรายการข้อค้นพบใน `rtm.md`

**สถานะ:** Feature tests และ production Build ผ่านจริงบน CI; Spec resolution/Integration/E2E ยังไม่สมบูรณ์

## สถานะทบทวน 12 พ.ย. 2026 (ใช้แทนข้อความสถานะปัจจุบันในบันทึกเก่าด้านบน)

ตรวจใน branch ทีม feature/751-uc01-uc07 แล้ว ดู [ผลตรวจรวม](../../docs/srs/UC01-UC07-final-review-20261112.md) สำหรับสิ่งที่ครบและยังขาด บันทึกผล Fork ด้านบนเป็นประวัติ ไม่ใช่ผลปัจจุบัน
มี component tests ใหม่ใน frontend/src/__tests__/uc01_uc07_ui.test.jsx ผ่านสองข้อ (UC-01 บันทึกและข้อความยืนยัน; UC-07 ซ่อนปุ่มอาจารย์จาก committee) และ prototype contract ผ่าน 11 ข้อ; ยังไม่มี Browser E2E หรือ Auth จริง จึงคงสถานะ acceptance ที่ยังไม่ครบไว้
ผล backend ใช้ Actions ของ branch ทีม; ไม่สรุป full suite ผ่านจากชื่อ job สีเขียวเมื่อเป็น non-gating ให้ดูผล diagnostic/counts ในรอบล่าสุด
