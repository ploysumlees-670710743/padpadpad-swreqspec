# RTM: UC-09 เข้าสู่ระบบ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2026-11-13 07:40 UTC | test: Backend 108 ผ่าน, 27 ไม่ผ่าน; Frontend 40 ผ่าน, 13 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-LOG-01 | AC-LOG-01 | T-04 | `frontend/src/pages/LoginPage.jsx: LoginPage`; `frontend/src/App.jsx: App`; `frontend/src/main.jsx: RouteRoot` | `test_AC_LOG_01_login_success_by_role_ui` (ผ่าน; มีการ render หน้าล็อกอิน) | ครบ |
| FR-LOG-02 | AC-LOG-01, AC-LOG-02, AC-LOG-03 | T-03–T-08 | `backend/app/api/authentication.py: LoginRequest, login`; `frontend/src/pages/LoginPage.jsx: handleSubmit`; `frontend/src/api/client.js: login` | `test_AC_LOG_01_login_success_by_role`, `test_AC_LOG_02_invalid_credentials`, `test_TC_LOG_02_1_correct_username_wrong_password`, `test_TC_LOG_02_2_wrong_username_correct_password`, `test_AC_LOG_03_unauthorized_account` และ UI tests (ผ่าน) | ครบ |
| FR-LOG-03 | AC-LOG-01, AC-LOG-02, AC-LOG-03 | T-01, T-02, T-03, T-05, T-07 | `backend/app/services/authentication_service.py: authenticate_user`; `backend/db/schema.sql: user_accounts` | `test_login_schema_foundation`, `test_login_authentication_service`, AC-LOG-01–03 API tests (ผ่าน); ไม่มีการทดสอบเชื่อม PostgreSQL จริง | ช่องโหว่ |
| FR-LOG-04 | AC-LOG-01, AC-LOG-03 | T-01, T-02, T-03, T-07 | `backend/app/services/authentication_service.py: authenticate_user`; `backend/app/api/authentication.py: login` | `test_login_authentication_service`, `test_AC_LOG_01_login_success_by_role`, `test_AC_LOG_03_unauthorized_account` และ TC-LOG-03-1/2 (ผ่าน) | ครบ |
| FR-LOG-05 | AC-LOG-01 | T-03, T-04 | `backend/app/api/authentication.py: _ROLE_MENUS, login, read_role_home`; `frontend/src/pages/RoleHomePage.jsx: RoleHomePage`; `frontend/src/App.jsx: App` | `test_AC_LOG_01_login_success_by_role` ตรวจเมนู API; `test_AC_LOG_01_login_success_by_role_ui` ตรวจเมนูทุก role (ผ่าน) | ครบ |
| FR-LOG-06 | AC-LOG-02 | T-05, T-06 | `backend/app/api/authentication.py: login`; `frontend/src/pages/LoginPage.jsx: handleSubmit` | `test_AC_LOG_02_invalid_credentials`, TC-LOG-02-1/2 API และ UI tests ตรวจ 401, ข้อความตาม spec และการคงหน้า Login (ผ่าน) | ครบ |
| FR-LOG-07 | AC-LOG-03 | T-07, T-08 | `backend/app/api/authentication.py: login`; `frontend/src/pages/LoginPage.jsx: handleSubmit` | `test_AC_LOG_03_unauthorized_account`, TC-LOG-03-1/2 API และ UI tests ตรวจการปฏิเสธ, ข้อความตาม spec และการคงหน้า Login (ผ่าน) | ครบ |
| Security | AC-LOG-01–03 | T-02, T-05, T-07 | `backend/app/services/authentication_service.py: hash_password, verify_password`; `backend/main.py: create_app`; `frontend/src/api/client.js: createApiClient` | `test_login_authentication_service` ตรวจ hash และไม่บันทึก plaintext ใน log (ผ่าน); ไม่มี test ยืนยัน TLS | ช่องโหว่ |
| Performance | ไม่มี AC | T-03 | `backend/app/api/authentication.py: login`; `backend/app/services/authentication_service.py: authenticate_user` | ไม่มี test วัดการตอบสนองไม่เกิน 2 วินาที ณ สภาวะโหลดปกติ | ช่องโหว่ |
| Usability (Responsive Design) | AC-LOG-01–03 | T-04, T-06, T-08 | `frontend/src/pages/LoginPage.css: @media (max-width: 700px)` | มี CSS สำหรับ viewport แคบ แต่ไม่มี test ตรวจหน้าจอ desktop/mobile | ช่องโหว่ |
| Constraint: รองรับ Chrome, Firefox, Safari, Edge (ไม่มี ID) | ไม่มี AC โดยตรง | T-04 | `frontend/src/main.jsx: RouteRoot`; `frontend/src/pages/LoginPage.jsx: LoginPage` | มี Vitest/jsdom เท่านั้น ไม่มีผลทดสอบบน browser ที่ระบุ | ช่องโหว่ |
| Constraint: ส่ง credentials ผ่าน HTTPS (ไม่มี ID) | ไม่มี AC โดยตรง | T-03, T-04 | `backend/main.py: create_app`; `frontend/src/api/client.js: createApiClient` | ไม่มีการบังคับ HTTPS หรือ test ยืนยัน TLS | ช่องโหว่ |
| Constraint: ตรวจสิทธิ์ร่วมกับฐานข้อมูลหลัก (ไม่มี ID) | ไม่มี AC โดยตรง | T-01, T-02 | `backend/app/db/database.py: get_database_connection`; `backend/app/services/authentication_service.py: authenticate_user`; `backend/db/schema.sql: user_accounts` | API tests ใช้ fake connection และ schema test ใช้ SQLite; ไม่มี PostgreSQL integration test หรือ code apply schema ให้ฐานข้อมูล | ช่องโหว่ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/main.py: create_app` | FR-LOG-01–07, Security | ตรงบางส่วน | Mount `/login` และ `/home` พร้อม signed session; ไม่กำหนด `https_only=True` และไม่มี HTTPS redirect จึงไม่รับประกันการส่ง credential ผ่าน TLS หากให้บริการผ่าน HTTP |
| `backend/app/api/authentication.py: POST /login (LoginRequest, login)` | FR-LOG-02–07, AC-LOG-01–03 | ตรง | รับ username/password, ปฏิเสธ credential/status/role ที่ไม่ผ่าน, เก็บ session และคืนเมนูเฉพาะ role; error detail เป็น generic แต่ UI แปลง 401/403 เป็นข้อความตาม spec |
| `backend/app/api/authentication.py: GET /home (read_role_home)` | FR-LOG-05, AC-LOG-01 | ตรงบางส่วน | อ่าน `user_id` และ `role` จาก signed session แล้วคืน role/menu; response มี `username` เพิ่มเติมจาก plan |
| `backend/app/services/authentication_service.py: hash_password, verify_password, authenticate_user` | FR-LOG-03, FR-LOG-04, Security | ตรงบางส่วน | ใช้ password hash, เปรียบเทียบแบบ constant-time, ตรวจ active status/allowed roles และไม่ log plaintext; พารามิเตอร์ hash เป็นค่าที่กำหนดในโค้ด และยังไม่มีผลวัด NFR Performance |
| `backend/app/models/user_account.py: UserAccount` | FR-LOG-03, FR-LOG-04, ASM-LOG-01–03 | ตรง | มี username/password_hash/status/role สำหรับ login และคง user_id/display_name สำหรับ legacy callers |
| `backend/app/middleware/auth.py: bind_session_user, get_current_user_id` | FR-LOG-04, FR-LOG-05, Security | ตรง | bind ทั้ง identity และ role ลง session; identity resolver อ่านจาก session/request state |
| `backend/db/schema.sql: user_accounts` | FR-LOG-03, FR-LOG-04, Security | ตรงบางส่วน | เก็บ password_hash ไม่ใช่ plaintext และมี status/role; ไม่มี code ใน startup ที่ apply schema นี้กับ PostgreSQL |
| `frontend/src/api/client.js: createApiClient.login, getRoleHome` | FR-LOG-02, FR-LOG-05, Security | ตรงบางส่วน | ส่ง JSON ไป `/login` และเรียก `/home` โดยแนบ credentials; ใช้ relative URL หรือ base URL ที่กำหนดได้โดยไม่ตรวจ scheme HTTPS |
| `frontend/src/pages/LoginPage.jsx: LoginPage, handleSubmit` | FR-LOG-01, FR-LOG-02, FR-LOG-06, FR-LOG-07 | ตรง | แสดงฟอร์ม; map 401/403 เป็นข้อความตาม spec และแสดงที่หน้า Login; มี welcome/secure-note copy ที่ spec ไม่ได้ระบุ |
| `frontend/src/App.jsx: App` | FR-LOG-01, FR-LOG-05 | ตรง | แสดง `/login`, นำทางไป `/home` หลัง login สำเร็จ และ render RoleHomePage |
| `frontend/src/pages/RoleHomePage.jsx: RoleHomePage` | FR-LOG-05 | ตรงบางส่วน | แสดงเมนูจาก role; แสดง username เพิ่มเติมซึ่งไม่มีข้อกำหนดใน FR หรือ plan ข้อ 4 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง / ของแถม
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-04 | test อ่อน | `backend/main.py: create_app`; `frontend/src/api/client.js: createApiClient` | Constraint: ส่ง credentials ผ่าน HTTPS; Security | แอปไม่บังคับ HTTPS และ SessionMiddleware ไม่กำหนด secure-only cookie; client ใช้ relative/base URL โดยไม่ตรวจ scheme จึงยังยืนยันไม่ได้ว่า deployment บังคับ TLS ด้านหน้าหรือไม่ |  |
| F-05 | test อ่อน | `backend/app/db/database.py: ensure_database`; `backend/db/schema.sql: user_accounts`; `backend/tests/test_login_schema_foundation.py` | FR-LOG-03, Constraint: ฐานข้อมูลหลัก | `ensure_database()` ตรวจเพียงการเชื่อมต่อ (`SELECT 1`); ไม่มี code apply DDL ของ `user_accounts`; tests ตรวจ schema ด้วย SQLite และใช้ fake connection จึงยังไม่ยืนยันว่าตารางอยู่และ auth query ทำงานกับ PostgreSQL ฐานข้อมูลหลัก |  |
| F-06 | test อ่อน | `backend/app/services/authentication_service.py: authenticate_user`; `backend/tests/` | Performance | ไม่มี test วัดเกณฑ์ตอบสนองไม่เกิน 2 วินาทีในสภาวะโหลดปกติ ทั้งที่ T-03 เสร็จแล้ว |  |
| F-07 | test อ่อน | `frontend/src/pages/LoginPage.jsx`; `frontend/src/__tests__/` | Constraint: รองรับ Chrome, Firefox, Safari, Edge | ชุดทดสอบที่มีเป็น Vitest/jsdom; ไม่มีหลักฐานทดสอบบน browser ที่ spec ระบุ จึงยืนยัน compatibility ไม่ได้ |  |
| F-08 | test อ่อน | `frontend/src/pages/LoginPage.css`; `frontend/src/__tests__/` | Usability: Responsive Design | มี media query สำหรับหน้าจอแคบ แต่ไม่มี test หรือผลลองใช้งานยืนยันการแสดงผลบน desktop และ mobile |  |
| F-09 | ของแถม | `backend/app/api/authentication.py: read_role_home`; `frontend/src/pages/RoleHomePage.jsx: RoleHomePage` | FR-LOG-05; plan.md ข้อ 4 | response ของ `/home` มี `username` และหน้า Home แสดง username ทั้งที่ spec/plan ระบุให้แสดงหน้าหลักและเมนูตาม role แต่ไม่ได้กำหนดให้แสดง username |  |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-01 | ปรับ `UserAccount` ให้รองรับ username/password_hash/status/role พร้อมคงฟิลด์ legacy ที่จำเป็น | `test_login_schema_foundation`, `test_login_authentication_service` และ AC-LOG-01–03 API tests ผ่าน |
| F-02 | `bind_session_user` รับและเก็บ role ใน signed session; root `backend/main.py` mount authentication router | `test_AC_LOG_01_login_success_by_role` ตรวจ `/home` และเมนูหลัง login ผ่าน |
| F-03 | UI map status 401/403 เป็นข้อความตาม spec และ test ตรวจข้อความกับการคงหน้า Login | AC-LOG-02 และ AC-LOG-03 Vitest tests ผ่าน; generic API detail ไม่ได้แสดงตรงแก่ผู้ใช้ |
