# แผนงาน: ติดตามความเรียบร้อยระหว่างค่าย

## 1. สรุปแนวทาง
- ฟีเจอร์นี้ช่วยให้อาจารย์สามารถติดตามสถานะการดำเนินงานของค่าย ดูสถิติการเช็คชื่อ และบันทึกผลติดตามปัญหา/ข้อร้องเรียนที่เกิดขึ้นระหว่างกิจกรรม
- ผู้ใช้หลักคือ อาจารย์ที่ได้รับมอบหมายให้ดูแลค่าย และต้องมีสิทธิ์ตาม SEC-RBAC-01 จึงจะสามารถดูข้อมูลและบันทึกผลได้
- ระบบจะจัดให้มีหน้าจอสรุปค่ายและหน้าแบบฟอร์มติดตามผล โดยใช้ข้อมูลจากฐานข้อมูลค่ายและข้อมูลเช็คชื่อในการแสดงสถานะปัจจุบัน
- เมื่ออาจารย์บันทึกผลสำเร็จ ระบบจะจัดเก็บข้อมูลและส่งการแจ้งเตือนแบบ asynchronous ผ่าน Notification ของระบบและ Email ให้แก่เจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย หากมีประเด็นต้องแก้ไข
- หากเป็นปัญหาร้ายแรง ระบบจะเปิดฟอร์มคำสั่งด่วนและส่งการแจ้งเตือน High Priority พร้อมบันทึก Audit Log เพื่อเป็นหลักฐานการปฏิบัติหน้าที่

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React + Vite สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับหน้าแดชบอร์ดค่ายและฟอร์มติดตามผล |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับ API ดึงข้อมูลค่าย, บันทึกผลติดตาม, และส่งการแจ้งเตือน |
| Notification Service + Email gateway | IF-NOT-01 | ใช้ส่งการแจ้งเตือนแบบ asynchronous ให้แก่เจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย |
| Audit Log storage | DOM-AUD-01 | บันทึกทุกครั้งที่มีการส่งคำสั่งด่วนหรือรายงานปัญหาร้ายแรง |
| Role-based access control | SEC-RBAC-01 | จำกัดให้เฉพาะอาจารย์ที่ได้รับมอบหมายจากโครงการนั้นเท่านั้นที่เข้าถึงข้อมูลและบันทึกผล |

## 3. โมเดลข้อมูล

### 3.1 Camp
| ฟิลด์หลัก | คำอธิบาย | รองรับ |
|---|---|---|
| camp_id | รหัสค่าย | FR-MON-01, FR-MON-02 |
| name | ชื่อค่าย | FR-MON-01, FR-MON-02 |
| status | สถานะค่าย เช่น In-Progress | DOM-CAMP-01, FR-MON-01 |
| approved_at | วันเวลาที่อนุมัติ | DOM-CAMP-01 |
| advisor_id | อาจารย์ผู้รับผิดชอบหลัก | SEC-RBAC-01 |

### 3.2 AttendanceSummary
| ฟิลด์หลัก | คำอธิบาย | รองรับ |
|---|---|---|
| camp_id | รหัสค่าย | FR-MON-02 |
| total_participants | จำนวนผู้เข้าร่วม | FR-MON-02 |
| checked_in_count | จำนวนที่เช็คชื่อแล้ว | FR-MON-02 |
| attendance_rate | อัตราการเข้าร่วม/เช็คชื่อ | FR-MON-02 |
| updated_at | เวลาที่อัปเดตล่าสุด | FR-MON-02 |

### 3.3 MonitoringRecord
| ฟิลด์หลัก | คำอธิบาย | รองรับ |
|---|---|---|
| monitoring_id | รหัสบันทึกติดตาม | FR-MON-03, FR-MON-04 |
| camp_id | รหัสค่ายที่ติดตาม | FR-MON-03, FR-MON-04 |
| advisor_id | อาจารย์ผู้บันทึก | FR-MON-03, FR-MON-04, SEC-RBAC-01 |
| note | ข้อสังเกต | FR-MON-03 |
| completion_rating | ผลการประเมินความเรียบร้อย | FR-MON-03 |
| activity_details | รายละเอียดกิจกรรม | FR-MON-03 |
| execution_result | ผลการดำเนินการ | FR-MON-03 |
| issue_detail | ปัญหาที่เกิดขึ้น | FR-MON-03 |
| issue_flag | มีประเด็นต้องแก้ไขหรือไม่ | FR-MON-03, FR-MON-04 |
| created_at | วันเวลาบันทึก | FR-MON-04 |

### 3.4 UrgentActionLog
| ฟิลด์หลัก | คำอธิบาย | รองรับ |
|---|---|---|
| urgent_id | รหัสคำสั่งด่วน | FR-MON-05, DOM-AUD-01 |
| monitoring_id | รหัสบันทึกที่เกี่ยวข้อง | FR-MON-05 |
| urgent_message | ข้อความคำสั่งด่วน | FR-MON-05 |
| priority | ระดับความสำคัญ | FR-MON-05 |
| sent_at | วันเวลาแจ้งเตือน | FR-MON-05, DOM-AUD-01 |
| recipients | ผู้รับแจ้งเตือน | FR-MON-05, IF-NOT-01 |

> ไม่มีฟิลด์ที่เก็บข้อมูลที่ไม่ได้ระบุในข้อกำหนด ดังนั้นจะไม่สร้างข้อมูลส่วนตัวหรือฟิลด์ที่ขัดกับ constraints

## 4. API / หน้าจอ

- GET /camps/in-progress — แสดงรายชื่อค่ายที่อยู่ระหว่างดำเนินกิจกรรม; input: advisor_id; output: list ของ camp summary; รองรับ FR-MON-01
- GET /camps/{camp_id}/dashboard — แสดงแดชบอร์ดสรุปค่ายและสถิติการเช็คชื่อ; input: camp_id; output: camp overview + attendance summary; รองรับ FR-MON-02
- POST /camps/{camp_id}/monitoring-records — บันทึกผลติดตามอาจารย์; input: note, completion_rating, activity_details, execution_result, issue_detail, issue_flag; output: created monitoring_id; รองรับ FR-MON-03, FR-MON-04
- POST /notifications/issue-alert — ส่งแจ้งเตือนเมื่อมีประเด็นต้องแก้ไข; input: camp_id, issue_detail, recipients; output: enqueue status; รองรับ FR-MON-04, IF-NOT-01
- POST /camps/{camp_id}/urgent-actions — บันทึกคำสั่งด่วนและส่งแจ้งเตือน High Priority; input: urgent_message, priority, recipients; output: urgent_id + success status; รองรับ FR-MON-05, DOM-AUD-01, NFR-REL-01
- UI page: /camps/:id/monitoring — หน้าแสดงสรุปค่ายและฟอร์มบันทึกติดตาม; input: camp_id; output: dashboard + monitoring form; รองรับ FR-MON-01, FR-MON-02, FR-MON-03

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| SEC-RBAC-01 | Role-based access control ใน API และหน้า monitoring; จำกัดเฉพาะอาจารย์ที่ได้รับมอบหมายในค่าย | ใช้แล้ว |
| DOM-CAMP-01 | GET /camps/in-progress และหน้า monitoring ตรวจสอบ camp status ก่อนเปิดฟอร์ม | ใช้แล้ว |
| IF-NOT-01 | POST /notifications/issue-alert และ POST /camps/{camp_id}/urgent-actions ส่งผ่าน Notification + Email แบบ asynchronous | ใช้แล้ว |
| DOM-AUD-01 | UrgentActionLog entity และ POST /camps/{camp_id}/urgent-actions บันทึกเหตุการณ์ทุกครั้งที่มีคำสั่งด่วนหรือปัญหาร้ายแรง | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-MON-01 | `test_AC_MON_01_save_monitoring_and_dashboard` | เปิดค่ายที่มีสถานะ In-Progress → ตรวจสอบ dashboard และบันทึกผลติดตาม → ยืนยันข้อมูลถูกบันทึกลงฐานข้อมูล |
| AC-MON-02 | `test_AC_MON_02_send_issue_notification_to_relevant_staff` | บันทึกปัญหาที่มีประเด็นต้องแก้ไข → กดยืนยัน → ตรวจสอบว่าได้บันทึก log และส่ง notification/email ไปยังเจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย |
| AC-MON-03 | `test_AC_MON_03_send_urgent_action_to_relevant_staff` | เลือกปัญหาร้ายแรง → ระบุคำสั่งด่วน → กดส่ง → ตรวจสอบข้อมูล urgent action ถูกบันทึกและมีการส่ง High Priority alert |
| AC-MON-04 | `test_AC_MON_04_block_monitoring_for_non_in_progress_camp` | ลองเข้าถึงเมนูติดตามค่ายที่ไม่ผ่านอนุมัติหรือสถานะสิ้นสุด → ตรวจสอบว่าระบบปิดการบันทึกและแสดงข้อจำกัด |

## 7. ลำดับงาน

1. สร้างหน้าและ API สำหรับแสดงค่ายที่อยู่ระหว่างดำเนินกิจกรรมและตรวจสิทธิ์ตาม SEC-RBAC-01 (FR-MON-01)
2. สร้าง dashboard สำหรับสรุปค่ายและสถิติการเช็คชื่อ พร้อมตรวจเงื่อนไขค่ายที่ยังเป็น In-Progress (FR-MON-02, DOM-CAMP-01)
3. สร้างฟอร์มติดตามผลพร้อม field สำหรับข้อสังเกต รายละเอียดกิจกรรม ผลการดำเนินการ ปัญหา และประเด็นที่ต้องแก้ไข (FR-MON-03)
4. สร้าง logic validate และบันทึก MonitoringRecord ลงฐานข้อมูล เมื่อผู้ใช้กดยืนยัน (FR-MON-03, FR-MON-04, AC-MON-01)
5. สร้างการแจ้งเตือนแบบ asynchronous ผ่าน Notification ของระบบและ Email ให้แก่เจ้าหน้าที่ค่ายและอาจารย์ผู้ดูแลค่าย เมื่อมีประเด็นต้องแก้ไข (FR-MON-04, IF-NOT-01, AC-MON-02)
6. สร้างฟอร์มคำสั่งด่วนสำหรับปัญหาร้ายแรง พร้อมบันทึก Audit Log และส่ง High Priority alert (FR-MON-05, DOM-AUD-01, AC-MON-03)
7. ทดสอบ end-to-end ตาม AC-MON-01 ถึง AC-MON-04 และตรวจสอบว่าไม่ผ่านค่ายที่ไม่ได้รับอนุมัติหรือสิ้นสุดแล้ว

## 8. สิ่งที่ยังไม่ทำ

- Q-01: จำเป็นต้องมีกลไกให้อาจารย์กด "รับทราบการแก้ปัญหา" เมื่อคณะกรรมการจัดการประเด็นเสร็จสิ้นหรือไม่?  
  ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
