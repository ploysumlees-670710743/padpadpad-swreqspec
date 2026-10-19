# RTM: จัดการสถานะการสมัคร
อ้างอิง: [spec.md](./spec.md) Draft v2 | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
สร้างด้วย /verify เมื่อ 2026-10-19 | test: 10 ผ่าน 0 ไม่ผ่าน (fallback จาก repo root); คำสั่ง `cd backend && pytest -v` เก็บ test ไม่สำเร็จ 5 collection errors; `cd frontend && npm test` ไม่มี test script

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-STA-01 | AC-STA-01 | T-01 | `backend/app/api/application_status.py: GET /me`; `ApplicationStatusService.get_for_student`; `frontend/src/pages/ApplicationStatusPage.jsx` | `test_AC_STA_01_owner_sees_application_status_and_camp_details` และ `test_AC_STA_01_non_owner_is_forbidden_without_disclosing_application` ผ่าน backend; ไม่มี UI test ที่ตรวจการแสดงผล | ช่องโหว่ |
| FR-STA-02 | AC-STA-02, AC-STA-03 | T-02, T-03, T-04, T-05 | ยังไม่มีตัวเลือกยืนยัน/สละสิทธิ์ใน API หรือ UI | ไม่มี test สำหรับ AC-STA-02/03 | ยังไม่ถึง |
| FR-STA-03 | AC-STA-02 | T-02, T-03, T-06, T-08 (T-08 รอ Q-01) | ยังไม่มี transition ยืนยันสิทธิ์ | ไม่มี test สำหรับ AC-STA-02 | ยังไม่ถึง |
| FR-STA-04 | AC-STA-03 | T-04, T-05, T-06 | ยังไม่มี transition สละสิทธิ์, dialog, popup หรือ email | ไม่มี test สำหรับ AC-STA-03 | ยังไม่ถึง |
| FR-STA-05 | AC-STA-04 | T-07, T-08 | ยังไม่มี scheduled job เปลี่ยนสถานะ | ไม่มี test สำหรับ AC-STA-04 | รอ Q-01 |
| NFR-PERF-01 | AC-STA-01 | T-01 | `ApplicationStatusService.get_for_student`; `ApplicationStatusPage` โหลดข้อมูล แต่ไม่มี measurement | ไม่มี test วัดเวลาโหลด 1.5 วินาที; พบ F-02 | ช่องโหว่ |
| NFR-USE-01 | AC-STA-03 | T-03, T-05 | ยังไม่มี confirmation dialog สำหรับสละสิทธิ์ | ไม่มี UI test | ยังไม่ถึง |
| CON-SEC-01 | AC-STA-01 | T-01 | API ตรวจ owner ใน `get_application_by_id`; `get_current_student_id` อ่าน `request.state.student_id` | `test_AC_STA_01_non_owner_is_forbidden_without_disclosing_application` ผ่านเมื่อ override identity; ไม่มี middleware ที่ตั้ง identity ใน workspace; พบ F-03 | ช่องโหว่ |
| CON-DATA-01 | AC-STA-02, AC-STA-03, AC-STA-04 | T-02, T-04, T-06, T-07 | ยังไม่มีการเปลี่ยนสถานะหรือ Event Audit Log | ไม่มี test audit log | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/application_status.py: GET /api/applications/me` (`get_my_application`) | FR-STA-01 | สอดคล้องบางส่วน | คืนรายละเอียดของนักศึกษาที่ dependency ระบุ; กรณีไม่พบข้อมูลตอบ 404 ซึ่ง spec ไม่ได้กำหนด |
| `backend/app/api/application_status.py: GET /api/applications/{application_id}` (`get_application_by_id`) | FR-STA-01, CON-SEC-01 | สอดคล้องบางส่วน | ตรวจเจ้าของก่อนคืนข้อมูลและตอบ 403 โดยไม่เปิดเผยข้อมูลแก่ผู้ใช้อื่น |
| `backend/app/api/application_status.py: get_application_status_service` | FR-STA-01 | สอดคล้อง | จัดหา read service |
| `backend/app/middleware/auth.py: get_current_student_id` | CON-SEC-01 | บางส่วน | ปฏิเสธเมื่อไม่มี identity แต่เป็น dependency boundary เท่านั้น; ไม่มี trusted middleware ใน workspace ที่เติม `request.state.student_id` |
| `backend/app/services/application_status_service.py: initialize` | FR-STA-01 | สอดคล้อง | สร้าง schema ใบสมัคร |
| `backend/app/services/application_status_service.py: get_for_student` | FR-STA-01, CON-SEC-01 | สอดคล้อง | query จำกัดด้วย student_id ที่ dependency ให้ |
| `backend/app/services/application_status_service.py: get_by_id` | FR-STA-01, CON-SEC-01 | สอดคล้อง | คืน owner ให้ API ตรวจสิทธิ์ก่อนตอบข้อมูล |
| `backend/app/models/application_status.py: ApplicationStatus` | FR-STA-01 | สอดคล้อง | response fields ครอบคลุม status และรายละเอียดค่ายตาม AC |
| `frontend/src/api/client.js: getMyApplication` | FR-STA-01 | สอดคล้อง | เรียก GET `/api/applications/me` และโยน error ชัดเจน |
| `frontend/src/pages/ApplicationStatusPage.jsx: ApplicationStatusPage` | FR-STA-01, CON-SEC-01 | สอดคล้องบางส่วน | แสดงสถานะและรายละเอียด; แสดง error จาก API แต่ไม่มี test UI ยืนยันการแสดงผล/ข้อความสิทธิ์ |
| `frontend/src/main.jsx: createRoot` | FR-STA-01 | สอดคล้องด้านการ mount | mount หน้า ApplicationStatusPage |
| `backend/app/main.py: lifespan` | FR-STA-01 | สอดคล้องด้าน initialize | เรียก initialize schema ก่อนรับ request |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | test อ่อน | `backend/tests/test_AC_STA_01.py` และไม่มี frontend test สำหรับ UC-14 | AC-STA-01, FR-STA-01 | AC กำหนดให้ระบบแสดงข้อมูลบนหน้าจอ แต่ test ที่ผ่านตรวจเฉพาะ JSON จาก API; หน้า `ApplicationStatusPage` ไม่มี test ยืนยันว่าฟิลด์และข้อความแสดงจริง | |
| F-02 | test อ่อน | ไม่มี performance test สำหรับ T-01 | NFR-PERF-01 | T-01 ถูกทำเครื่องหมายเสร็จ แต่ไม่มีการวัดเวลาหน้าจอโหลดเสร็จภายใน 1.5 วินาที | |
| F-03 | AC ไม่มี test | `backend/app/middleware/auth.py: get_current_student_id`; `backend/tests/test_AC_STA_01.py` | CON-SEC-01 | ไม่มี middleware ใน workspace ที่กำหนด `request.state.student_id`; test แทน identity dependency ด้วย override จึงไม่ยืนยันเส้นทางยืนยันตัวตนจริง และ API ปกติจะ 401 หากไม่มี integration ภายนอก | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
