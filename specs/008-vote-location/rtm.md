# RTM: ลงคะแนนและสรุปผลสถานที่ (UC-08)

อ้างอิง: [spec.md](./spec.md) Draft v2 | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
ตรวจด้วย /verify เมื่อ 2026-11-13 08:28 UTC | Backend: 108 ผ่าน, 27 ไม่ผ่าน, 1 warning | Frontend: 40 ผ่าน, 13 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป AC ไป task ไป โค้ด ไป test)

| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VOT-01 | AC-VOT-01 | T-03, T-08 | `VoteService.get_vote_locations`; `GET /api/votes/locations`; `VoteLocationPage` | `test_AC_VOT_01_vote_locations_api_returns_prototype_location_details` ผ่าน; `test_AC_VOT_01_vote_page_select_and_confirm`, `test_AC_VOT_01_loads_simulated_locations_without_calling_the_backend` ไม่ผ่าน | ช่องโหว่ — UI ใช้ข้อมูลจำลองคนละชุดกับข้อมูลที่ tests ส่งให้ |
| FR-VOT-02 | AC-VOT-03 | T-06, T-07 | `VoteService.cast_vote`; `getVoteAccess`; `VoteLocationPage` | `test_AC_VOT_03_forbid_voter_without_role_for_current_round` ผ่าน; `test_AC_VOT_03_hide_vote_action_for_student` ผ่านโดย mock role | ช่องโหว่ — UI คืน role `lecturer` คงที่และยังไม่อ่าน role จากระบบกลาง (F-05) |
| FR-VOT-03 | AC-VOT-01 | T-02, T-03 | `VoteLocationPage.handleSubmit`; `castVote`; `POST /api/votes` | `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่าน; `test_AC_VOT_01_vote_page_select_and_confirm` ไม่ผ่าน | ช่องโหว่ — frontend ไม่เรียก POST API จริง (F-04) |
| FR-VOT-04 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `vote_eligibility`; `VoteService.cast_vote` | `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot`, `test_TC_VOT_01_1_api_records_vote_and_updates_total`, `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total` ผ่าน | ช่องโหว่ — service ทำงานใน isolated tests แต่ flow จริงยังไม่มี trusted identity และ frontend ใช้ in-memory state (F-04, F-05) |
| FR-VOT-05 | AC-VOT-01 | T-02, T-03, T-08, T-09 | `VoteService.cast_vote/get_vote_locations`; `VoteLocationPage.handleSubmit` | API test ตรวจยอดหลังบันทึกผ่าน; UI update/tie tests ใน `test_AC_VOT_01.test.jsx` ไม่ผ่าน | ช่องโหว่ — GET คืนยอดตัวอย่างคงที่ ส่วน UI เปลี่ยนยอดเฉพาะ in-memory prototype จึงไม่ sync ผู้ใช้หรือระบบอื่น (F-04) |
| FR-VOT-06 | AC-VOT-02 | T-04, T-05 | `AlreadyVotedError`; `POST /api/votes`; `VoteLocationPage` | `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total` และ `test_AC_VOT_02_disable_repeat_confirmation` ผ่าน | ช่องโหว่ — API ป้องกันซ้ำได้ แต่ frontend ยังไม่ใช้ผลสิทธิ์/การโหวตจาก backend จริง (F-04) |
| NFR-PERF-01 | AC-VOT-01, AC-VOT-02 | T-02, T-04 | `VoteService.cast_vote: sqlite3.connect(timeout=5)` | ไม่มี performance test หรือผลวัด p95 | ช่องโหว่ — ไม่มีหลักฐาน ≤2 วินาที และ lock timeout 5 วินาทีอาจเกินเกณฑ์ (F-01, F-02) |
| NFR-SEC-01 | AC-VOT-02 | T-01, T-02, T-04, T-05 | `VoteService.cast_vote` (`BEGIN IMMEDIATE`); `VoteLocationPage.handleSubmit` (`isSubmitting`) | duplicate tests ผ่านแบบเรียงลำดับ; ไม่มี test แข่งส่งคำขอพร้อมกัน ทั้งที่ TC-VOT-02-3 เป็น “ใช้ได้” | ช่องโหว่ — ยังไม่มีหลักฐานทดสอบ concurrency ตาม CON-TECH-01 (F-06) |
| NFR-USE-01 | AC-VOT-01 | T-03 | `VoteLocationPage`; `VoteLocationPage.css` | UI tests บางส่วนตรวจข้อความ/ข้อมูล แต่ AC-VOT-01 UI tests 3 กรณีไม่ผ่าน; ไม่มี usability test กับผู้ใช้ | ช่องโหว่ — ยังยืนยันความเข้าใจได้ทันทีโดยไม่ฝึกอบรมไม่ได้ (F-07) |
| CON-SEC-01 | AC-VOT-03 | T-06, T-07 | `get_authenticated_voter_id`; `getVoteAccess`; `backend/app/main.py` | API test เมื่อไม่มี identity และ UI test เมื่อ auth ล้มเหลวผ่าน โดย mock/override | ช่องโหว่ — ไม่มี trusted middleware ที่เชื่อมระบบกลาง; role ฝั่ง UI เป็นค่าคงที่ (F-05) |
| CON-TECH-01 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `vote_eligibility` primary key; `VoteService.cast_vote` transaction | schema uniqueness และ rollback tests ผ่าน; ไม่มี concurrent-submission test | ช่องโหว่ — ยังไม่มี test ที่ยืนยันการป้องกัน race condition ภายใต้คำขอพร้อมกัน (F-06) |
| CON-DATA-01 | AC-VOT-01 | T-01, T-02 | `VoteEligibility`; `VoteBallot`; `vote_eligibility`, `vote_ballots` | `test_t01_vote_models_validate_required_fields_and_keep_ballot_anonymous`, `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot`, `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่าน | ครบ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)

| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/votes.py: GET /api/votes/locations (get_vote_locations)` | FR-VOT-01, FR-VOT-05, Q-02 | ตรงบางส่วน | คืน prototype locations พร้อมชื่อ/รูป/สรุป; `total_votes` และ `has_voted` เป็นค่าจำลอง ไม่อ่านผล/สิทธิ์จริง |
| `backend/app/api/votes.py: POST /api/votes (cast_vote)` | FR-VOT-02..06, CON-SEC-01, CON-DATA-01 | ตรงบางส่วน | รับ `round_id/location_id` แต่ไม่รับ voter identity; อ่าน identity จาก `request.state`; แปลงผู้ไม่มีสิทธิ์เป็น 403 และใช้สิทธิ์แล้วเป็น 409; ไม่ตรวจว่า `location_id` อยู่ในรายการที่อนุมัติ (F-03) |
| `VoteRequest`, `VoteResponse`, `VoteLocationResponse`, `VoteLocationsResponse` | FR-VOT-01, FR-VOT-03..06, CON-DATA-01 | ตรงบางส่วน | คำขอไม่รับ user ID; response ส่งยอดและสถานะใช้สิทธิ์; response รายการเป็นรูปแบบ prototype |
| `backend/app/services/vote_service.py: VoteService.initialize` | FR-VOT-04, CON-DATA-01 | ตรง | สร้าง schema จาก `backend/db/schema.sql` |
| `backend/app/services/vote_service.py: VoteService.get_vote_locations` | FR-VOT-01, FR-VOT-05, Q-02 | ตรงบางส่วน | คืน `DEMO_LOCATIONS` และ `has_voted=False` คงที่ ไม่สะท้อนยอด ballot หรือสิทธิ์จากฐานข้อมูล |
| `backend/app/services/vote_service.py: VoteService.cast_vote` | FR-VOT-02..06, CON-TECH-01, CON-DATA-01, NFR-PERF-01 | ตรงบางส่วน | ใช้ transaction และตาราง eligibility แยก ballot; ไม่ตรวจ candidate location; SQLite lock timeout 5 วินาที (F-01, F-03) |
| `backend/app/models/vote.py: VoteEligibility, VoteBallot` | FR-VOT-04, CON-DATA-01 | ตรง | `VoteBallot` ไม่มี voter ID; `VoteEligibility` แยก user/round |
| `backend/db/schema.sql: vote_eligible_users, vote_eligibility, vote_ballots` | FR-VOT-02, FR-VOT-04, NFR-SEC-01, CON-DATA-01 | ตรงบางส่วน | eligibility มี unique user/round และ ballot ไม่มี user ID; ไม่มี constraint ผูก ballot กับ candidate list |
| `backend/app/middleware/authz.py: get_authenticated_voter_id` | FR-VOT-02, CON-SEC-01 | ตรงบางส่วน | fail-closed ด้วย 503 และข้อความตาม spec เมื่อไม่มี trusted user ID; app ไม่มี middleware ที่ populate state จากระบบกลาง (F-05) |
| `backend/app/main.py: lifespan/app` | FR-VOT-01..06, CON-TECH-01 | ตรงบางส่วน | mount vote router และ initialize service; ไม่มี authentication middleware สำหรับ vote |
| `frontend/src/api/client.js: getVoteAccess` | FR-VOT-02, CON-SEC-01 | ไม่ตรง | คืน `lecturer` คงที่ ไม่ตรวจ role หรือสถานะ auth จากระบบกลาง (F-05) |
| `frontend/src/api/client.js: getVoteLocations, castVote, resetVoteDemo` | FR-VOT-01, FR-VOT-03..06, Q-02 | ไม่ตรงกับ API flow ใน plan | ใช้ `Map` ใน memory ไม่เรียก GET/POST vote endpoints; ข้อมูลจำลองไม่ตรงกับ fixture ใน AC-VOT-01 UI tests และ reload ไม่คงสถานะ (F-04) |
| `frontend/src/pages/VoteLocationPage.jsx: VoteLocationPage/handleSubmit` | FR-VOT-01..06, NFR-USE-01, NFR-SEC-01, Q-01, Q-02 | ตรงบางส่วน | แสดงรายการ/เลือก radio 1 แห่ง/แสดง tie/disable ปุ่ม; ใช้ client จำลอง และ AC-VOT-01 UI tests ปัจจุบันไม่ผ่าน |
| `frontend/src/main.jsx: RouteRoot` | FR-VOT-01..03 | ตรงบางส่วน | `?feature=vote-location` เปิดหน้าได้ และ route เริ่มต้นเป็น VoteLocationPage; ไม่มีการเชื่อม role/auth ใน route |
| `backend/app/api/application_status.py`, `application_status_service.py`, `ApplicationStatusPage.jsx` และโมดูลฟีเจอร์อื่น | ไม่ใช่ UC-08 | ไม่เกี่ยวกับ UC-08 | ไม่พบพฤติกรรม vote เพิ่มเติมในโมดูลเหล่านี้จากการค้น references; ไม่นับเป็น requirement ของ UC-08 |

## 3. ข้อค้นพบ

ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | ตัวเลขไม่ตรง spec | `backend/app/services/vote_service.py: VoteService.cast_vote` | NFR-PERF-01 | ตั้ง SQLite lock timeout เป็น 5 วินาที ทั้งที่ spec กำหนดเวลาประมวลผลบันทึกไม่เกิน 2 วินาที p95; timeout นี้อาจทำให้คำขอรอเกินเกณฑ์ | แก้โค้ด — ปรับการจัดการ SQLite Lock Timeout ให้สอดคล้องกับ NFR-PERF-01 และทดสอบว่าเวลาบันทึกไม่เกิน 2 วินาที p95 |
| F-02 | test อ่อน | ไม่มี performance test สำหรับ T-02 | NFR-PERF-01 | T-02 ถูกทำเครื่องหมายเสร็จ แต่ไม่มีผลวัด p95 หรือ test ยืนยันเกณฑ์ 2 วินาที จึงยังยืนยัน NFR ไม่ได้ |แก้โค้ด — เพิ่ม Performance Test สำหรับ T-02 เพื่อวัดและรายงานค่า p95 พร้อมหลักฐานยืนยันเกณฑ์ 2 วินาที|
| F-03 | โค้ดไม่มี FR | `backend/app/services/vote_service.py: VoteService.cast_vote`; `backend/app/api/votes.py: cast_vote` | FR-VOT-01, FR-VOT-03 | API รับ location_id ที่ผู้เรียกส่งมาแล้วบันทึกโดยไม่ตรวจว่าอยู่ในรายการสถานที่ที่ผ่านการพิจารณา ผู้มีสิทธิ์จึงส่ง ID ที่ไม่มีในรายการจำลองหรือรายการอนุมัติได้ | แก้โค้ด — เพิ่ม Backend Validation เพื่อตรวจสอบว่า location_id อยู่ในรายการสถานที่ที่ผ่านการพิจารณาก่อนบันทึกคะแนน |
| F-04 | โค้ดไม่มี FR | `frontend/src/api/client.js: getVoteLocations/castVote`; `VoteLocationPage: handleSubmit`; `VoteService.get_vote_locations` | FR-VOT-05, FR-VOT-06, AC-VOT-01, AC-VOT-02 | frontend ใช้ in-memory `Map` แทนการเรียก GET/POST vote API; backend GET คืนยอด/has_voted คงที่ จึงไม่ persist/sync ผลจริง; AC-VOT-01 UI tests ทั้ง 3 กรณีไม่ผ่าน เพราะหน้าใช้ข้อมูลจำลองคนละชุดกับ fetch fixture และไม่แสดง tie ตาม fixture | แก้โค้ด — เชื่อม Frontend กับ Vote API จริง และปรับ Backend ให้บันทึกคะแนนและส่งยอดคะแนนกับสถานะ has_voted จากข้อมูลจริง |
| F-05 | ละเมิด Constraint | `backend/app/middleware/authz.py`; `backend/app/main.py`; `frontend/src/api/client.js: getVoteAccess` | CON-SEC-01, FR-VOT-02, AC-VOT-03 | ไม่มี middleware ใน app ที่ populate `request.state.user_id` จากระบบกลาง; API ปกติจึง fail-closed ด้วย 503 และ UI คืน role `lecturer` คงที่ ทำให้ไม่ตรวจ role จริง | แก้โค้ด — เชื่อม Middleware กับระบบ Authentication กลางเพื่อรับ user_id และ role จริง แทนการกำหนด role คงที่ใน Frontend|
| F-06 | test อ่อน | `backend/tests` สำหรับ T-01/T-02/T-04 | CON-TECH-01, NFR-SEC-01 | ไม่มี concurrent-submission test; TC-VOT-02-3 ใน test-cases.md เปลี่ยนเป็น “ใช้ได้” แล้ว แต่ไม่มี test `test_TC_VOT_02_3_concurrent_submissions_record_one_vote` ในโค้ด |แก้โค้ด — เพิ่ม Concurrent-submission Test เพื่อยืนยันว่าการส่งคะแนนพร้อมกันไม่ทำให้เกิดการบันทึกคะแนนซ้ำ|
| F-07 | test อ่อน | ไม่มี usability evaluation สำหรับ `frontend/src/pages/VoteLocationPage.jsx` | NFR-USE-01 | test ตรวจการแสดงชื่อ/รายละเอียด/คะแนน แต่ไม่มีเกณฑ์หรือผลทดสอบกับผู้ใช้เพื่อยืนยันว่าเข้าใจหน้าสรุปได้ทันทีโดยไม่ฝึกอบรม | แก้โค้ด — เพิ่ม Usability Evaluation กับผู้ใช้จริง พร้อมกำหนดเกณฑ์วัดว่าเข้าใจหน้าสรุปได้โดยไม่ต้องฝึกอบรม |
| F-08 | AC ไม่มี test | `backend/tests`, `frontend/src/__tests__`, `test-cases.md` | AC-VOT-01, AC-VOT-02 | test-cases ทำเครื่องหมาย “ใช้ได้” แต่ไม่มี test code สำหรับกรณี committee ลงคะแนน (TC-VOT-01-3) และกรณีเคยลงคะแนนเฉพาะรอบก่อนแต่ลงรอบปัจจุบันได้ (TC-VOT-02-4); test ที่มีใช้ lecturer และไม่ทดสอบเงื่อนไขรอบก่อนหน้า |แก้โค้ด — เพิ่ม Test สำหรับกรณี Committee ลงคะแนน และกรณีผู้ใช้ที่เคยลงคะแนนในรอบก่อนสามารถลงคะแนนในรอบปัจจุบันได้|

## 4. แก้แล้ว

| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
