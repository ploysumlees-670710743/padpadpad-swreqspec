# แผนทางเทคนิค: UC-03 ตรวจเอกสารผู้สมัคร

## 1. สรุปแนวทาง

1. สร้างหน้ารายการผู้สมัครสำหรับคณะกรรมการ และจัดการกรณีไม่มีผู้สมัครตาม FR-VER-01
2. สร้างหน้ารายละเอียดผู้สมัครที่แสดงข้อมูลส่วนตัวและไฟล์สแกนเอกสารแนบตาม FR-VER-02 และ FR-VER-03
3. ให้คณะกรรมการเลือกผลผ่าน/ไม่ผ่าน พร้อมเหตุผลและรายการเอกสารที่ต้องแก้ไขตาม FR-VER-04 และ FR-VER-06
4. บันทึกผล สถานะ และ Audit Log ของการตรวจสอบตาม FR-VER-05 และ ASM-VER-04
5. แจ้งสถานะและเหตุผลให้นักศึกษาผ่าน Notification, Email และหน้าจอผู้สมัครตาม FR-VER-05 และ ASM-VER-05

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
| :--- | :--- | :--- |
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้ารายการผู้สมัคร หน้ารายละเอียด และแบบฟอร์มผลตรวจตาม FR-VER-01, FR-VER-02, FR-VER-04 และ FR-VER-06 |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้ให้บริการข้อมูลผู้สมัคร ผลตรวจ สถานะ และ Audit Log ตาม FR-VER-01, FR-VER-03, FR-VER-05 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บผู้สมัคร เอกสาร ผลตรวจ สถานะ และ Audit Log ตาม ASM-VER-01 และ ASM-VER-04 |
| กลไกส่ง Notification และ Email | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้ส่งการแจ้งเตือนเมื่อบันทึกผลตาม FR-VER-05 และ ASM-VER-05; รายละเอียดผู้ให้บริการยังไม่กำหนดใน spec |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
| :--- | :--- | :--- |
| Applicant | applicant_id, personal_data, application_status | FR-VER-01, FR-VER-02, FR-VER-05, ASM-VER-01, ASM-VER-03 |
| ApplicantDocument | document_id, applicant_id, document_type, file, document_data | FR-VER-03, FR-VER-06, ASM-VER-02 |
| VerificationAuditLog | audit_id, applicant_id, inspector_id, inspected_at, result, reason | FR-VER-05, AC-VER-01, AC-VER-02, AC-VER-03, ASM-VER-04 |
| VerificationIssue | issue_id, applicant_id, document_id, note | FR-VER-06, AC-VER-03 |
| ApplicantNotification | notification_id, applicant_id, status, reason, notification_type | FR-VER-05, AC-VER-01, AC-VER-02, AC-VER-03, ASM-VER-05 |

`ApplicantDocument` ต้องรองรับไฟล์สแกนเอกสารแนบและข้อมูลที่ใช้เปรียบเทียบกับข้อมูลผู้สมัครตาม FR-VER-03 และ ASM-VER-02 ฟิลด์อื่นนอกเหนือจากที่ระบุใน spec จะยังไม่กำหนดเพิ่มเติม

## 4. API / หน้าจอ

- `GET /committee/applicants`: แสดงรายชื่อผู้สมัครตาม FR-VER-01; output คือรายการผู้สมัคร หรือข้อความ “ยังไม่มีรายการผู้สมัครที่รอการตรวจสอบ” พร้อมสถานะซ่อนปุ่มแอ็กชันเมื่อไม่มีรายการ
- `GET /committee/applicants/{applicant_id}`: รับรหัสผู้สมัครตาม FR-VER-02; output คือข้อมูลส่วนตัวและไฟล์สแกนเอกสารแนบสำหรับตรวจตาม FR-VER-03
- `POST /committee/applicants/{applicant_id}/verification`: รับ inspector_id, result, reason, รายการเอกสารที่มีปัญหา และหมายเหตุ ตาม FR-VER-04 และ FR-VER-06; output คือผลตรวจ สถานะใหม่ และข้อมูล Audit Log ตาม FR-VER-05
- `GET /applicants/{applicant_id}/verification-status`: แสดงสถานะและเหตุผลบนหน้าจอของผู้สมัครตาม FR-VER-05 และ ASM-VER-05
- `VerificationNotification`: ส่ง Notification และ Email พร้อมสถานะและเหตุผลหลังบันทึกผลตาม FR-VER-05, AC-VER-01, AC-VER-02 และ AC-VER-03

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
| :--- | :--- | :--- |
| ไม่มี CON/DOM/IF ใน spec | ไม่มี Constraint ที่ต้องนำไปใช้ | ยังไม่ได้ใช้ เพราะ spec ไม่ได้ระบุ Constraint |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
| :--- | :--- | :--- |
| AC-VER-01 | `test_AC_VER_01_approve_complete_documents` | เตรียมผู้สมัครที่มีข้อมูลส่วนตัวและเอกสารครบถ้วน ตรวจเอกสารแล้วบันทึกผลผ่าน ตรวจ Audit Log, สถานะ “ผ่านการตรวจเอกสาร”, Notification, Email และหน้าจอผู้สมัครตาม AC-VER-01 |
| AC-VER-02 | `test_AC_VER_02_reject_with_reason` | เลือกผลไม่ผ่านและกรอกเหตุผลใน Text Area ตรวจว่าบันทึกข้อมูลผู้ตรวจ เวลา ผล และเหตุผลใน Audit Log สถานะเป็น “เอกสารไม่ถูกต้อง/ต้องแก้ไข” และแจ้งนักศึกษาตาม AC-VER-02 |
| AC-VER-03 | `test_AC_VER_03_collect_document_correction_items` | เลือกหัวข้อเอกสารที่มีปัญหา พิมพ์หมายเหตุ และบันทึกผลไม่ผ่าน ตรวจรายการที่ต้องแก้ไข สถานะ Audit Log Notification และ Email ตาม AC-VER-03 |

## 7. ลำดับงาน

1. สร้างโมเดล Applicant และ ApplicantDocument สำหรับข้อมูลผู้สมัครและเอกสารแนบตาม FR-VER-01, FR-VER-02 และ FR-VER-03
2. สร้างหน้ารายการผู้สมัครและกรณีไม่มีรายการตาม FR-VER-01
3. สร้างหน้ารายละเอียดสำหรับเลือกผู้สมัครและตรวจข้อมูล/เอกสารตาม FR-VER-02 และ FR-VER-03
4. สร้างแบบฟอร์มผลผ่าน/ไม่ผ่านและช่องเหตุผลที่บังคับเมื่อไม่ผ่านตาม FR-VER-04
5. สร้างการเลือกหัวข้อเอกสารที่มีปัญหาและหมายเหตุเพิ่มเติมตาม FR-VER-06
6. สร้างการบันทึกสถานะและ VerificationAuditLog ตาม FR-VER-05 และ ASM-VER-03 ถึง ASM-VER-04
7. สร้างการส่ง Notification, Email และการแสดงสถานะ/เหตุผลบนหน้าจอผู้สมัครตาม FR-VER-05 และ ASM-VER-05
8. ทดสอบ AC-VER-01, AC-VER-02 และ AC-VER-03 ตามตารางแผนทดสอบ

## 8. สิ่งที่ยังไม่ทำ

ไม่มี Open Questions ใน spec.md ฉบับ Draft v2 ดังนั้นไม่มีส่วนที่ต้องชะลอการสร้างเพราะรอคำตอบ
