# RTM: UC-01 บันทึกข้อมูลสถานที่และชุมชน

อ้างอิง: [spec.md](./spec.md) Draft v2 | [plan.md](./plan.md) Draft | [tasks.md](./tasks.md) Draft v1 | [test-cases.md](./test-cases.md)
ตรวจด้วย /verify เมื่อ 2026-11-13 08:07 UTC | Backend: 108 ผ่าน, 27 ไม่ผ่าน, 1 warning | Frontend: 40 ผ่าน, 13 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป AC ไป task ไป โค้ด ไป test)

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-01-01 | AC-01 (Given); ไม่ตรวจการเข้าถึงเมนู | T-05 | `frontend/src/main.jsx: RouteRoot`; `frontend/src/pages/CommunityLocationPage.jsx: CommunityLocationPage` | `uc01_uc07_ui.test.jsx: AC-01` ผ่าน แต่ render page โดยตรง ไม่ทดสอบเมนู/route | ช่องโหว่ — ไม่มีเมนูหรือลิงก์ให้คณะกรรมการเปิดหน้านี้ (F-UC01-10) |
| FR-01-02 | AC-01 (Given) | T-01, T-04, T-05 | `backend/app/api/communities.py: get_assigned_locations`; `community_location_service.py: list_assigned_locations`; `CommunityLocationPage: locations` | `test_AC_01_FR_01_02_lists_only_assigned_locations` ผ่าน; ทดสอบ API ด้วย dependency override ไม่ใช่ app ที่ deploy | ช่องโหว่ — assignment/auth จริงยังไม่เชื่อม และ route ไม่ได้ mount ใน app (F-UC01-01, F-UC01-02, F-UC01-08) |
| FR-01-03 | ไม่มี AC ที่ระบุ local rules | T-01–T-05 | `CommunityFields.local_rules`; `CommunityService.create`; `CommunityLocationPage: textarea` | `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่านและตรวจค่า local_rules ใน SQLite test | ช่องโหว่ — local rules ไม่อยู่ใน Then ของ AC-01 และไม่กำหนดความครบถ้วน (F-UC01-05) |
| FR-01-04 | AC-01 ตรวจชื่อและเบอร์ แต่ไม่ตรวจตำแหน่งผู้ดูแล | T-01, T-03, T-05 | `CommunityFields.caretaker_title`; `CommunityService.create/update`; `CommunityLocationPage: submit` | API test ส่ง caretaker_title แต่ไม่ assert ค่าที่บันทึก; UI ทำ field นี้ optional | ช่องโหว่ — FR ระบุตำแหน่งผู้ดูแล แต่ AC/test ไม่ยืนยัน และ plan กำหนด optional (F-UC01-05) |
| FR-01-05 | AC-01 (When/Then) | T-03, T-05, T-06 | `create_community`; `CommunityLocationPage: submit` | `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่าน; `uc01_uc07_ui.test.jsx: AC-01` ผ่านด้วย in-memory demo client | ช่องโหว่ — ไม่มีการทดสอบ flow ผ่าน app/API จริง และ router ไม่ได้ mount (F-UC01-06, F-UC01-08) |
| AF-01-01 | ไม่มี AC เฉพาะ | T-03, T-05, T-06 | `CommunityFields.no_blank_required_fields`; `CommunityLocationPage: submit` | `test_AC_01_AF_01_01_rejects_required_field_without_saving` ผ่าน 4 input cases แต่ใช้ router ที่ test mount เอง | ช่องโหว่ — endpoint ไม่ได้ถูกเปิดจาก app ที่ใช้จริง (F-UC01-08) |
| C-01 | AC-01 (Given) | T-01, T-03, T-04, T-06 | `get_committee_user_id`; `CommunityService.require_assignment/list_assigned_locations/update` | `test_AC_01_C_01_cross_camp_denied_for_create_read_update`, `...unauthenticated_and_wrong_role_fail_closed`, `...assigned_committee_can_edit_without_changing_location` ผ่าน; identity/assignment ถูก override/seed ใน test | ช่องโหว่ — UC-09 trusted identity และ assignment provisioning ยังไม่เชื่อม (F-UC01-01, F-UC01-02) |
| C-02 | ไม่มี AC โดยตรง | T-01, T-05, T-06 | `local_rules: str`; `uc01_communities.local_rules TEXT`; `CommunityLocationPage: textarea` | API save test ตรวจค่า local_rules เป็นข้อความผ่าน แต่ไม่มี test ระบุชนิดข้อมูล/ข้อห้ามไฟล์แนบแยก | ช่องโหว่ — ไม่มี AC/test ชัดเจนยืนยันขอบเขต Text เป็นหลัก (F-UC01-05) |
| QR-01 | ไม่มี AC ด้านเวลา | T-06 | `CommunityService.connect: sqlite3.connect(timeout=5)`; `create_community` | ไม่มี performance test; `TC-UC01-06` ระบุรอวัดจริง | ช่องโหว่ — ยังไม่มีผลวัด ≤2 วินาที และ lock wait ที่ตั้งไว้ 5 วินาทีอาจเกินเกณฑ์ (F-UC01-03, F-UC01-09) |
| QR-02 | ไม่มี AC ด้าน usability | T-05, T-06 | `CommunityLocationPage`; `frontend/src/ucPrototype.css` | UI component test ผ่าน 1 กรณี UC-01 บน demo; ไม่มี usability test กับผู้ใช้ | ช่องโหว่ — ยังไม่มีหลักฐานว่าใช้งานง่าย/ข้อความผิดพลาดชัดเจนตามเกณฑ์ (F-UC01-06) |
| ASM-01-01 | AC-01 (Given) | T-01, T-03, T-04 | `CommunityService.require_assignment`; `get_committee_user_id` | Cross-camp API test ผ่านโดย seed assignment และ override user | ช่องโหว่ — ไม่พบกระบวนการ provision assignment จริง และไม่มี authentication integration (F-UC01-01, F-UC01-02) |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/main.py: app/lifespan` | FR-01-01..05, AF-01-01, C-01 | ไม่ตรงใน app ที่ import ใช้งาน | มีการสร้าง `app`/lifespan ที่ mount communities ก่อน แล้วประกาศ `app` ชุดที่สองทับ; `app.openapi()` ไม่มี `/api/communities` หรือ `/api/locations/*` (F-UC01-08) |
| `backend/main.py: create_app` | FR-01-01..05, C-01 | ไม่รองรับ UC-01 | entrypoint นี้ mount authentication/enrollment เท่านั้น; ไม่มี communities router |
| `backend/app/api/communities.py: POST /api/communities (create_community)` | FR-01-03..05, AF-01-01, AC-01, C-01 | ตรงบางส่วน | validates required community/caretaker/phone, calls service, but endpoint absent from active app; caretaker_title optional |
| `backend/app/api/communities.py: GET /api/locations/assigned (get_assigned_locations)` | FR-01-02, C-01 | ตรงบางส่วน | Returns assignment-filtered locations; depends on trusted request state and unmounted router |
| `backend/app/api/communities.py: GET /api/locations/{location_id}/communities (get_communities)` | FR-01-01..02, C-01 | ตรงบางส่วน | Lists only assigned camp records; endpoint is not registered by active app |
| `backend/app/api/communities.py: PUT /api/communities/{community_id} (update_community)` | C-01, Scope | ตรงบางส่วน | Update keeps original location; endpoint is not registered by active app |
| `backend/app/services/community_location_service.py: CommunityService` | FR-01-02..05, AF-01-01, AC-01, C-01, C-02 | ตรงบางส่วน | SQLite tables and assignment scoping; no assignment provisioning method; connection lock timeout is 5 seconds |
| `frontend/src/main.jsx: RouteRoot` | FR-01-01 | ตรงบางส่วน | Query `?feature=community-location` renders page, but no menu/link in UI opens it |
| `frontend/src/pages/CommunityLocationPage.jsx: CommunityLocationPage/submit` | FR-01-01..05, AF-01-01, QR-02 | ตรงบางส่วน | Form, assigned-location select, textarea, success/error states, and edit UI; page test uses demo client, caretaker title is optional |
| `frontend/src/api/communityClient.js: communityClient` | FR-01-02..05, C-01 | ตรงตาม API plan | Calls GET/POST/PUT with credentials; backend endpoints are absent from actual app |
| `frontend/src/api/ucPrototypeClients.js: createCommunityPrototypeClient` | AC-01, AF-01-01, C-01 (demo only) | ไม่ใช่ production behavior | In-memory demo is explicitly labeled; `uc01_uc07_ui.test.jsx` uses it and therefore does not verify backend integration |

## 3. ข้อค้นพบ

ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง / ของแถม
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-UC01-01 | Integration pending | API Auth | C-01 | ยังไม่มี middleware UC-09 เติม trusted `request.state.user_id/role`; หากไม่มี dependency override API ปฏิเสธคำขอ | |
| F-UC01-02 | Dependency pending | assignment DB | C-01 | ต้อง provision user/location โดยทีมอย่างปลอดภัย; service ไม่มี flow สร้าง assignment และ test ใส่ข้อมูลเอง | |
| F-UC01-03 | Performance | QR-01 | QR-01 | ยังไม่ยืนยันการตอบสนองภายใน 2 วินาทีของระบบจริง | |
| F-UC01-04 | Open Questions | spec.md | Q-01-01, Q-01-02 | เบอร์โทร/ชื่อซ้ำ/ไฟล์แนบยังไม่มีคำตอบ; ไม่พบโค้ดเดา regex, duplicate rule หรือ upload | |
| F-UC01-05 | FR ไม่มี AC | spec.md, `CommunityFields`, `CommunityLocationPage` | FR-01-03, FR-01-04, C-02 | AC-01 ไม่ระบุ local_rules หรือตำแหน่งผู้ดูแล; โค้ดและ plan ทำตำแหน่ง optional และ test ไม่ assert ตำแหน่ง | |
| F-UC01-06 | test อ่อน | `uc01_uc07_ui.test.jsx`, `CommunityLocationPage.jsx` | FR-01-01, FR-01-05, QR-02 | มี component test ตรวจข้อความยืนยันแล้ว แต่ render ด้วย in-memory demo และเลือก location ที่ preselect; ไม่ทดสอบ route/API จริง, การเลือก location จาก assignment หรือ usability | |
| F-UC01-08 | โค้ดไม่มี FR | `backend/app/main.py: app` | FR-01-01..05, AF-01-01, C-01 | ประกาศ FastAPI app ชุดที่สองทับชุดแรกที่ mount `communities_router`; OpenAPI ของ `backend.app.main:app` ไม่มี UC-01 routes และ `backend.main:app` ก็ไม่มีเช่นกัน | |
| F-UC01-09 | ตัวเลขไม่ตรง spec | `backend/app/services/community_location_service.py: CommunityService.connect` | QR-01 | SQLite connection ตั้ง `timeout=5` วินาที ขณะที่ QR-01 กำหนดตอบสนองภายใน 2 วินาที; เมื่อรอ database lock request อาจเกินเกณฑ์ | |
| F-UC01-10 | โค้ดไม่มี FR | `frontend/src/main.jsx: RouteRoot`; `CommunityLocationPage.jsx` | FR-01-01 | เปิดหน้าได้เฉพาะผ่าน query `?feature=community-location`; ไม่พบเมนูหรือลิงก์ที่คณะกรรมการใช้เปิดการจัดการข้อมูลชุมชน | |

## 4. แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-UC01-07 | เพิ่ม dropdown สถานที่ค่ายจาก `client.locations()` แทนการให้พิมพ์รหัสเอง และ API service กรองรายการตาม assignment | `CommunityLocationPage` render `<select>` จากรายการที่โหลด; `test_AC_01_FR_01_02_lists_only_assigned_locations` ตรวจรายการเฉพาะค่ายที่ได้รับมอบหมาย (การเชื่อม UC-09/การเปิด route จริงยังคงอยู่ใน F-UC01-01, F-UC01-02 และ F-UC01-08) |
