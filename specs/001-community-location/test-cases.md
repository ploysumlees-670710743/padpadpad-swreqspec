# Test Cases: UC-01 Community Location

อ้างอิง: spec.md Draft v2 / AC-01 / AF-01-01 / C-01 / C-02

| TC ID | AC / Constraint | Given | When | Then | ตรวจด้วย | Test |
|---|---|---|---|---|---|---|
| TC-UC01-01 | AC-01 | คณะกรรมการได้รับมอบหมาย camp-1 | ส่งชื่อชุมชน ผู้ดูแล และเบอร์ติดต่อครบ | บันทึกเชื่อม location และแสดงยืนยัน | pytest | test_AC_01_Given_When_Then_persists_community_linked_to_camp |
| TC-UC01-02 | AF-01-01 | คณะกรรมการเปิดฟอร์ม | ข้อมูลสำคัญเป็นค่าว่าง | 422 และไม่มีข้อมูลถูกบันทึก | pytest | test_AC_01_AF_01_01_rejects_required_field_without_saving |
| TC-UC01-03 | C-01 | มีสิทธิ์ camp-1 แต่ไม่มีสิทธิ์ camp-2 | สร้าง/อ่าน/แก้ข้ามค่าย | ปฏิเสธ 403 | pytest | test_AC_01_C_01_cross_camp_denied_for_create_read_update |
| TC-UC01-04 | C-01 | ไม่มี Session/Role ที่เชื่อถือได้ | เรียก API | ปฏิเสธ 401 | pytest | test_AC_01_C_01_unauthenticated_and_wrong_role_fail_closed |
| TC-UC01-05 | C-01 | เป็นเจ้าของข้อมูลในค่ายที่ได้รับมอบหมาย | แก้ข้อมูล | บันทึกและคง location เดิม | pytest | test_AC_01_assigned_committee_can_edit_without_changing_location |
| TC-UC01-06 | QR-01 | มีฐานข้อมูลและ server ที่เหมือน production | บันทึกข้อมูล | เสร็จภายใน 2 วินาที | คน/ทดสอบประสิทธิภาพ | รอวัดจริง |
| TC-UC01-07 | FR-01-02 / C-01 | คณะกรรมการได้รับมอบหมายเฉพาะค่าย camp-1 | เปิดรายการสถานที่ค่ายที่เลือกได้ | API ส่งกลับเฉพาะ camp-1 และผู้ไม่มี assignment ได้รายการว่าง; ผู้ไม่เข้าสู่ระบบถูกปฏิเสธ | pytest | `test_AC_01_FR_01_02_lists_only_assigned_locations` |

ข้อสงสัย Q-01-01 (รูปแบบเบอร์โทร/ชื่อซ้ำ) และ Q-01-02 (ไฟล์แนบ) ยังไม่ออกแบบ Test บังคับตามคำตอบที่ยังไม่มี
