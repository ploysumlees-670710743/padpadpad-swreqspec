# Test Cases: UC-07 Project Approval

อ้างอิง spec.md Draft v2 / AC-07 / AF-07-01 / AF-07-02 / C-01 / C-02
ยังมี FR-07-01 ถึง FR-07-05 ซ้ำความหมายใน spec; รอทีมยืนยันหมายเลขก่อน Verify ครบ

| TC ID | AC / Constraint | Given | When | Then | ตรวจด้วย | Test |
|---|---|---|---|---|---|---|
| TC-UC07-01 | AC-07 | คณะกรรมการส่งโครงการและอาจารย์มีสิทธิ์ | กดอนุมัติ/ไม่อนุมัติ/ส่งแก้ไขพร้อมเหตุผล | สถานะและประวัติบันทึก พร้อมแจ้งเตือนคณะกรรมการ | pytest | test_AC_07_Given_When_Then_records_decision_history_and_notification |
| TC-UC07-02 | C-01 / QR-01 | อาจารย์ไม่ได้เป็นที่ปรึกษาโครงการ | กดอนุมัติ | ปฏิเสธ 403 และสถานะไม่เปลี่ยน | pytest | test_AC_07_unauthorized_faculty_cannot_review_other_project |
| TC-UC07-03 | AF-07-01 / C-02 | ส่งกลับแก้ไข | คณะกรรมการส่งใหม่; อาจารย์ไม่อนุมัติ | ส่งซ้ำหลัง revision ได้ และถูกยุติหลังไม่อนุมัติ (test นี้ตรวจหนึ่งรอบ ไม่ใช่ข้อจำกัดจำนวนรอบ) | pytest | test_AC_07_revision_allows_resubmit_but_rejection_is_terminal |
| TC-UC07-04 | QR-02 | มีประวัติอนุมัติ | พยายาม UPDATE หรือ DELETE history | SQLite ปฏิเสธ | pytest | test_AC_07_audit_log_cannot_be_edited_or_deleted |
| TC-UC07-05 | AF-07-01/02 | อาจารย์เลือกส่งแก้ไข | ไม่ระบุเหตุผล | ปฏิเสธและไม่เปลี่ยนสถานะ | pytest | test_AC_07_requires_reason_for_rejection_and_revision |
| TC-UC07-06 | C-01 | ผู้ใช้ไม่มี Session ที่เชื่อถือได้ | ส่งขออนุมัติ | ปฏิเสธ 401 | pytest | test_AC_07_unauthenticated_role_fails_closed |

สถานะร่าง: ควรให้ทีมตรวจว่า test ตรง AC ก่อนอนุมัติใช้งาน
