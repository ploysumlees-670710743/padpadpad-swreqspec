# ผลตรวจรอบสุดท้าย UC-01 / UC-07 — 12 พฤศจิกายน 2026

สถานะ: ตรวจครบตามขอบเขตโค้ดและเอกสาร แต่ยังไม่พร้อมรับรองระบบจริงหรือ SRS Final ไม่มีการแก้ main หรือเปิด PR
ฐานที่ตรวจ: branch feature/751-uc01-uc07 commit 4e75012487033c5f7447bbac4ce74e0f869da033

## ความครบและความสอดคล้อง

| เอกสาร | UC-01 | UC-07 |
|---|---|---|
| SRS | docs/srs/UC01-UC07-SRS-contribution.md ครบส่วนของตน เป็น Draft รอรวม SRS ทีม | ไฟล์เดียวกัน ระบุ FR ซ้ำและช่องว่างชัดเจน |
| spec.md | มี FR-01-01..05, AF, C, QR, AC และ Q | มีสองชุด FR-07-* ความหมายขัดกัน จึงยังรับรอง mapping ไม่ได้ |
| plan.md | มีฟอร์ม/API/SQLite/สิทธิ์; แก้คำ Text เท่านั้นเป็น Text เป็นหลักให้ตรง spec; เพิ่ม caretaker_title ในโมเดล | มี state/history/notification/API; เอกสารโครงการจริงและ Auth ยังรอทีม |
| tasks.md | T-01..06 ครบ; checkbox ไม่ใช่หลักฐานว่าทำไม่เสร็จทั้งหมด มี prototype แล้วแต่ยังรอ acceptance จริง | T-01 เป็น blocker; T-02..06 มี implementation บางส่วนตามบันทึก |
| test-cases.md | ตรวจพบชื่อ test อ้างอิงมีจริง รวม assigned locations; performance ยังรอวัด | ตรวจพบชื่อ test มีจริง; แก้ข้อความที่ทำให้เข้าใจว่าส่งซ้ำได้เพียงหนึ่งรอบ ไม่มีข้อจำกัดนั้นในโค้ด/spec |
| rtm.md | forward/reverse ครบ FR/AF/C/QR/ASM; มี gap ของ auth/performance/usability | mapping ชุดแรกเป็นข้อมูลชั่วคราว ไม่ใช่การเลือก baseline แทนทีม |

## โค้ดที่ตรวจ

- UC-01: communities.py, community_location_service.py, CommunityLocationPage.jsx, communityClient.js, test_AC_01.py รองรับบันทึก/อ่าน/แก้ข้อมูลตามค่ายที่ได้รับมอบหมาย, required fields และ local rules แบบข้อความ
- UC-07: project_approval.py, project_approval_service.py, ProjectApprovalPage.jsx, projectApprovalClient.js, test_AC_07.py รองรับส่ง/ส่งซ้ำหลัง revision, approved/rejected/revision, history แบบ append-only และ notification ในแอป
- backend/app/main.py ยังไม่ได้ผูก middleware ที่เติม trusted request.state.user_id/role สำหรับสอง UC; API จึงปฏิเสธการเรียกที่ไม่ผ่าน authentication การทดสอบใช้ dependency override ไม่ใช่ Login จริง
- หน้าของ UC-07 มีเพียงชื่อ/สถานะ/ประวัติ ไม่มีเอกสารเสนอโครงการฉบับเต็ม; approval state แยกจาก camp_projects.status ยังไม่เชื่อม workflow หลัก
- ไม่พบการเพิ่ม phone regex/ห้ามชื่อซ้ำ/ไฟล์แนบ/อนุมัติหลายระดับตามคำถามที่ยังไม่ตัดสิน

## แก้ส่วนทดสอบอย่างปลอดภัย

เพิ่ม @testing-library/react และ @testing-library/dom เป็น devDependencies พร้อม lockfile เพราะ test เดิม import แต่ไม่มี dependency; ไม่แก้ runtime API client, UI หรือ test ของเพื่อน
เพิ่ม uc01_uc07_ui.test.jsx สองข้อ: AC-01 กรอก/บันทึก/เห็นข้อความยืนยัน; AC-07/QR-01 คณะกรรมการไม่เห็นปุ่มพิจารณาของอาจารย์
เพิ่ม component test เป็น CI gate และ full frontend เป็น diagnostic ที่บันทึกจำนวนจริง ไม่ใช้ผลเขียวของ workflow แทนผลทดสอบรวม

## ผลรันใน Windows เครื่องนี้

- Node prototype: 11 ผ่าน, 0 ไม่ผ่าน
- Component tests ใหม่: 2 ผ่าน, 0 ไม่ผ่าน
- Vite production build: ผ่าน
- Frontend รวมก่อนเพิ่ม component tests: 26 ผ่าน, 11 ไม่ผ่าน จาก 37 ข้อ; หลังเพิ่มสองข้อรันซ้ำจริง: 28 ผ่าน 11 ไม่ผ่าน จาก 39 ข้อ
- สาเหตุที่ยังไม่ผ่าน: 8 ข้อเรียก createApiClient ที่ไฟล์ client.js ของทีมไม่ได้ export; อีก 3 ข้อหา text ซ้ำในหน้า enrollment/navigation (ต้องให้เจ้าของฟีเจอร์ตรวจ selector/พฤติกรรม)
- ไม่แก้ client.js หรือ tests ของเพื่อนเพื่อทำให้ตัวเลขผ่าน
- Python ในเครื่องเรียกไม่ได้ ใช้ GitHub Actions Ubuntu / Python 3.12 ตรวจ backend แทน
- npm แจ้ง dependency vulnerabilities 6 รายการ เป็นสถานะ dependency tree ที่ใช้ตรวจ ไม่ใช้ npm audit fix --force เพราะอาจเปลี่ยนเวอร์ชันและกระทบทีม

## ค้างก่อนรับรอง Final

1. ทีมยืนยันชุด FR-07-* และแก้ spec ต้นทางก่อนทำ RTM ฉบับรับรอง
2. เชื่อม UC-09 trusted identity/role และ provision location assignments/project memberships จริง
3. เชื่อมเอกสารโครงการและการแก้ข้อมูลหลัง revision รวมถึงสถานะโครงการหลัก
4. ยืนยันช่องทางแจ้งเตือน/การ refresh ของ committee (ปัจจุบันดึงรายการเมื่อโหลด ไม่ใช่ push)
5. วัด QR-01 UC-01 ภายใน 2 วินาทีในระบบจริง, usability และ browser E2E หลังเชื่อม dependencies
6. ทีมตอบ Q-01-01 เบอร์โทร/ชื่อซ้ำ, Q-01-02 ไฟล์แนบ, Q-07-01 หลายระดับ; ไม่ถือเป็น feature ที่อนุมัติแล้ว
7. ทีมยืนยันว่า local rules/ตำแหน่งผู้ดูแลใช้ AC-01 ร่วมพอหรือควรปรับ AC โดยเจ้าของ spec; รวม SRS ส่วนนี้กับฉบับกลุ่ม
8. เจ้าของ enrollment ตรวจปัญหา frontend รวม 11 ข้อก่อนอ้างว่า regression ทั้งระบบผ่าน

ผล CI รอบล่าสุดให้ดู workflow Verify UC-01 and UC-07 prototype บน commit ของรอบตรวจนี้ (full audits ไม่ใช่ gate ต้องดูจำนวน errors/failures)

## หลักฐาน GitHub Actions ที่ตรวจยืนยันแล้ว

[Run 43174829130](https://github.com/ploysumlees-670710743/padpadpad-swreqspec/actions/runs/43174829130) ทดสอบ commit 3938bd35ad8a26b6d0ef7da104c1f239d55e4499 บน Ubuntu / Python 3.12 / Node 22:

| ชุดตรวจ | ผลจริง |
|---|---|
| Backend เฉพาะ UC-01/UC-07 | ขั้น Execute only UC-01 and UC-07 tests ผ่าน |
| Offline prototype | ผ่าน (เครื่องนี้ 11/11) |
| Component tests ของสอง UC | ผ่าน (เครื่องนี้ 2/2) |
| Frontend build | ผ่าน |
| Frontend รวม | annotation: passed=28 failed=11 total=39; exit code 1 |
| Backend รวม | annotation JUnit: errors=16 failures=0 tests=16; exit code 2 — เป็น collection errors ไม่ใช่ 16 tests ที่รันผ่าน |

Workflow รวมแสดง success เพราะ audits ตั้ง continue-on-error; ต้องอ่านตัวเลขและ exit code ด้านบน ห้ามใช้สีเขียวตัดสินว่าทั้ง repository ผ่าน
ข้อแก้ไขต่อคำสรุปก่อนหน้า: คำกล่าวว่า backend รวมผ่านไม่ถูกต้อง ผลรอบนี้ยืนยันว่าเก็บชุดทดสอบไม่ครบ 16 errors สาเหตุรายไฟล์ต้องเปิด logs ของ Full backend regression audit ไม่อนุมานว่าเป็นปัญหาเดียวกับผล Fork เก่า
ไฟล์/ผลที่เปลี่ยนหลัง commit ทดสอบนี้เป็นบันทึกผลตรวจเท่านั้น ไม่แก้โค้ดที่ทดสอบแล้ว
