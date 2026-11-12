# RTM: ลงคะแนนและสรุปผลสถานที่
อ้างอิง: [spec.md](./spec.md) Draft v2 | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
สร้างด้วย /verify เมื่อ 2026-11-09 12:57 UTC | test: 24 ผ่าน 0 ไม่ผ่าน (backend fallback 15, frontend 9); `cd backend && pytest -v` เก็บ test ไม่สำเร็จ 9 collection errors เพราะ import `backend` ไม่พบ; `cd backend && PYTHONPATH=.. pytest -v` ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VOT-01 | AC-VOT-01 | T-03, T-08 | `backend/app/api/votes.py: get_vote_locations`; `backend/app/services/vote_service.py: VoteService.get_vote_locations`; `frontend/src/pages/VoteLocationPage.jsx: VoteLocationPage` | `test_AC_VOT_01_vote_locations_api_returns_prototype_location_details`, `test_AC_VOT_01_vote_page_select_and_confirm` (ผ่าน) | ครบ |
| FR-VOT-02 | AC-VOT-03 | T-06, T-07 | `backend/app/services/vote_service.py: VoteService.cast_vote`; `backend/app/api/votes.py: cast_vote`; `frontend/src/api/client.js: getVoteAccess` | `test_AC_VOT_03_forbid_voter_without_role_for_current_round`, `test_AC_VOT_03_hide_vote_action_for_student` (ผ่าน แต่ UI test mock role; production client คืน lecturer คงที่) | ช่องโหว่ |
| FR-VOT-03 | AC-VOT-01 | T-02, T-03 | `VoteLocationPage: handleSubmit`; `frontend/src/api/client.js: castVote`; `backend/app/api/votes.py: cast_vote`; `VoteService.cast_vote` | `test_TC_VOT_01_1_api_records_vote_and_updates_total`, `test_AC_VOT_01_vote_page_select_and_confirm` (ผ่าน; API ไม่ตรวจว่า location_id อยู่ในรายการที่อนุมัติ) | ช่องโหว่ |
| FR-VOT-04 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `backend/db/schema.sql: vote_eligibility`; `VoteService.cast_vote` | `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot`, `test_TC_VOT_01_1_api_records_vote_and_updates_total`, `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total` (ผ่าน) | ครบ |
| FR-VOT-05 | AC-VOT-01 | T-02, T-03, T-08, T-09 | `VoteService.cast_vote`, `VoteService.get_vote_locations`; `VoteLocationPage: handleSubmit` และการคำนวณ `tiedTopLocations` | `test_TC_VOT_01_1_api_records_vote_and_updates_total`, `test_AC_VOT_01_vote_page_select_and_confirm`, `test_tied_top_scores_show_all_tied_locations_without_selecting_a_winner` (ผ่าน; ไม่ได้ทดสอบการอัปเดตข้ามผู้ใช้ และหน้าเว็บไม่เรียก POST API) | ช่องโหว่ |
| FR-VOT-06 | AC-VOT-02 | T-04, T-05 | `VoteService.cast_vote`; `backend/app/api/votes.py: cast_vote`; `frontend/src/api/client.js: castVote`; `VoteLocationPage: handleSubmit` | `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total`, `test_AC_VOT_02_disable_repeat_confirmation` (ผ่าน; UI ใช้สถานะใน memory ไม่ได้โหลดสิทธิ์ที่ใช้ไปจาก backend) | ช่องโหว่ |
| NFR-PERF-01 | AC-VOT-01, AC-VOT-02 | T-02, T-04 | `backend/app/services/vote_service.py: VoteService.cast_vote` (`sqlite3.connect(timeout=5)`) | ไม่มี performance test หรือผลวัด p95 | ช่องโหว่ |
| NFR-SEC-01 | AC-VOT-02 | T-01, T-02, T-04, T-05 | `VoteService.cast_vote` (`BEGIN IMMEDIATE`, ตรวจ `has_voted`); `VoteLocationPage: handleSubmit` (`isSubmitting`/disable ปุ่ม) | `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total`, `test_AC_VOT_02_disable_repeat_confirmation` (ผ่าน; ไม่มี concurrent-submission test) | ช่องโหว่ |
| NFR-USE-01 | AC-VOT-01 | T-03 | `frontend/src/pages/VoteLocationPage.jsx: VoteLocationPage`; `frontend/src/pages/VoteLocationPage.css` | `test_AC_VOT_01_vote_page_select_and_confirm` ตรวจชื่อ/สรุป/คะแนน แต่ไม่มี usability test กับผู้ใช้ | ช่องโหว่ |
| CON-SEC-01 | AC-VOT-03 | T-06, T-07 | `backend/app/middleware/authz.py: get_authenticated_voter_id`; `backend/app/api/votes.py: cast_vote`; `frontend/src/api/client.js: getVoteAccess` | `test_AC_VOT_03_reject_when_authentication_identity_is_unavailable`, `test_AC_VOT_03_show_authentication_failure_notice` (ผ่าน; ไม่พบ trusted auth middleware ที่ populate request state หรือเชื่อมระบบกลาง) | ช่องโหว่ |
| CON-TECH-01 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `backend/db/schema.sql: vote_eligibility`; `VoteService.cast_vote` (`BEGIN IMMEDIATE`) | `test_t01_sqlite_vote_transaction_rolls_back_ballot_write`, `test_TC_VOT_01_1_api_records_vote_and_updates_total`, `test_AC_VOT_02_reject_duplicate_vote_without_incrementing_total` (ผ่าน; ไม่มี concurrent-submission test) | ช่องโหว่ |
| CON-DATA-01 | AC-VOT-01 | T-01, T-02 | `backend/db/schema.sql: vote_eligibility`, `vote_ballots`; `VoteBallot`; `backend/app/api/votes.py: VoteRequest` | `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot`, `test_TC_VOT_01_1_api_records_vote_and_updates_total` (ผ่าน; ballot ไม่มี user_id และ request ไม่รับ voter identity) | ครบ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/votes.py: GET /api/votes/locations` (`get_vote_locations`) | FR-VOT-01, FR-VOT-05, Q-02 | บางส่วน | คืนข้อมูลจำลองตาม Q-02; response `has_voted` เป็น false คงที่ และยอดไม่ได้อ่านจากบัตรที่บันทึกในฐานข้อมูล |
| `backend/app/api/votes.py: POST /api/votes` (`cast_vote`) | FR-VOT-02, FR-VOT-03, FR-VOT-04, FR-VOT-05, FR-VOT-06, CON-SEC-01, CON-DATA-01 | บางส่วน | ตรวจสิทธิ์และสถานะใช้สิทธิ์ซ้ำ, บันทึก ballot แบบไม่ระบุ voter และคืนยอด; ไม่ตรวจว่า location_id อยู่ในรายการที่ผ่านเกณฑ์ |
| `VoteRequest`, `VoteResponse`, `VoteLocationResponse`, `VoteLocationsResponse` | FR-VOT-01, FR-VOT-03, FR-VOT-05, CON-DATA-01 | สอดคล้องบางส่วน | request ไม่รับ user_id; response รายการและยอดคะแนนตรงรูปแบบที่ใช้ในต้นแบบ |
| `backend/app/api/votes.py: get_vote_service` | CON-TECH-01 | สอดคล้อง | สร้าง VoteService ใช้ฐานข้อมูล SQLite |
| `backend/app/middleware/authz.py: get_authenticated_voter_id` | CON-SEC-01 | บางส่วน | fail-closed และส่งข้อความตาม spec เมื่อไม่มี request.state.user_id; ไม่พบ middleware/ระบบกลางที่กำหนด identity ในแอป |
| `backend/app/services/vote_service.py: VoteService.initialize` | FR-VOT-04, CON-DATA-01 | สอดคล้อง | โหลด schema สำหรับ vote eligibility และ anonymous ballot |
| `backend/app/services/vote_service.py: VoteService.get_vote_locations` | FR-VOT-01, FR-VOT-05, Q-02 | บางส่วน | คืน DEMO_LOCATIONS คงที่และเรียงคะแนน; ไม่ได้อ่านคะแนนจาก vote_ballots หรือสถานะผ่านเกณฑ์จากแหล่งจริง |
| `backend/app/services/vote_service.py: VoteService.cast_vote` | FR-VOT-02, FR-VOT-03, FR-VOT-04, FR-VOT-05, FR-VOT-06, CON-TECH-01, CON-DATA-01 | บางส่วน | ใช้ transaction และแยก eligibility/ballot; รับ location_id ใดก็ได้และใช้ lock timeout 5 วินาที |
| `backend/db/schema.sql: vote_eligible_users`, `vote_eligibility`, `vote_ballots` | FR-VOT-02, FR-VOT-04, NFR-SEC-01, CON-DATA-01 | สอดคล้องบางส่วน | role ต่อรอบ, uniqueness ต่อ user/round, ballot ไม่มี voter ID; ไม่มีกุญแจ/ข้อบังคับยืนยัน location ที่อนุมัติ |
| `backend/app/models/vote.py: VoteEligibility`, `VoteBallot` | FR-VOT-04, CON-DATA-01 | สอดคล้อง | model แยกข้อมูลสิทธิ์กับบัตรลงคะแนน |
| `frontend/src/pages/VoteLocationPage.jsx: VoteLocationPage`, `handleSubmit` | FR-VOT-01, FR-VOT-02, FR-VOT-03, FR-VOT-05, FR-VOT-06, NFR-USE-01, Q-01, Q-02 | บางส่วน | แสดงรายการ/เลือก 1 แห่ง/แสดง tie; คะแนนที่ submit ปรับเฉพาะ state หน้าเว็บ และ role มาจาก mock client |
| `frontend/src/api/client.js: getVoteAccess`, `getVoteLocations`, `castVote`, `resetVoteDemo` | FR-VOT-02, FR-VOT-03, FR-VOT-05, FR-VOT-06, Q-02 | บางส่วน | getVoteAccess คืน lecturer คงที่; GET รายการเรียก backend แต่การ vote และยอดอยู่ใน memory ไม่เรียก POST `/api/votes` |
| `backend/app/main.py: lifespan` | CON-TECH-01, CON-DATA-01 | สอดคล้องบางส่วน | initialize services/schema ก่อนให้บริการ; ไม่ได้ติดตั้ง auth middleware สำหรับ vote |
| `backend/app/api/application_status.py`, `backend/app/services/application_status_service.py`, `frontend/src/pages/ApplicationStatusPage.jsx`, `frontend/src/api/client.js: getMyApplication` | FR-STA-01 (UC-14), CON-SEC-01 | ไม่ใช่ UC-08 | ส่วนของฟีเจอร์สถานะใบสมัครอื่น ไม่ใช่ของแถมจาก UC-08; ไม่นับเป็นความครอบคลุม requirement ของ UC-08 |
| `backend/app/models/` ที่เหลือและ `backend/app/services/application_status_service.py` | FR-SCH-01, FR-SEL-01–07, FR-STA-01 (ฟีเจอร์อื่น) | ไม่ใช่ UC-08 | models ตารางกิจกรรม/การคัดเลือก/สถานะสมัครไม่เพิ่มพฤติกรรมให้ UC-08 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | ตัวเลขไม่ตรง spec | `backend/app/services/vote_service.py: VoteService.cast_vote` | NFR-PERF-01 | ตั้ง SQLite lock timeout เป็น 5 วินาที ทั้งที่ spec กำหนดเวลาประมวลผลบันทึกไม่เกิน 2 วินาที p95; timeout นี้อาจทำให้คำขอรอเกินเกณฑ์ | |
| F-02 | test อ่อน | ไม่มี performance test สำหรับ T-02 | NFR-PERF-01 | T-02 ถูกทำเครื่องหมายเสร็จ แต่ไม่มีผลวัด p95 หรือ test ยืนยันเกณฑ์ 2 วินาที จึงยังยืนยัน NFR ไม่ได้ | |
| F-03 | โค้ดไม่มี FR | `backend/app/services/vote_service.py: VoteService.cast_vote`; `backend/app/api/votes.py: cast_vote` | FR-VOT-01, FR-VOT-03 | API รับ location_id ที่ผู้เรียกส่งมาแล้วบันทึกโดยไม่ตรวจว่าอยู่ในรายการสถานที่ที่ผ่านการพิจารณา ผู้มีสิทธิ์จึงส่ง ID ที่ไม่มีในรายการจำลองหรือรายการอนุมัติได้ | |
| F-04 | โค้ดไม่มี FR | `frontend/src/api/client.js: castVote`, `VoteLocationPage: handleSubmit`; `VoteService.get_vote_locations` | FR-VOT-05, FR-VOT-06, AC-VOT-01, AC-VOT-02 | หน้าเว็บจำลองการโหวตใน in-memory Map แทนการเรียก POST `/api/votes`; GET รายการคืนคะแนนตัวอย่างคงที่ จึงไม่ persist ผล, ไม่ sync ผู้ใช้อื่นแบบ real-time และ reload ทำให้ UI ลืมสิทธิ์ที่ใช้ไปแล้ว | |
| F-05 | ละเมิด Constraint | `backend/app/middleware/authz.py`; `backend/app/main.py`; `frontend/src/api/client.js: getVoteAccess` | CON-SEC-01, FR-VOT-02, AC-VOT-03 | dependency อ่าน request.state.user_id แต่ไม่พบ middleware ที่ populate identity หรือเชื่อมระบบยืนยันตัวตนกลาง; client ฝั่ง UI คืน role lecturer คงที่ ทำให้ไม่สามารถใช้ role/auth จริงได้และ request ปกติไม่มี identity จะถูกปฏิเสธ 503 | |
| F-06 | test อ่อน | `backend/tests` สำหรับ T-01/T-02/T-04 | CON-TECH-01, NFR-SEC-01 | มี test duplicate แบบเรียงลำดับและ test rollback transaction แยก แต่ไม่มี concurrent-submission test ของ VoteService/API; TC-VOT-02-3 ยังเป็นสถานะ “ร่าง” จึงยังไม่มีหลักฐานทดสอบ race condition ตาม requirement | |
| F-07 | test อ่อน | ไม่มี usability evaluation สำหรับ `frontend/src/pages/VoteLocationPage.jsx` | NFR-USE-01 | test ตรวจการแสดงชื่อ/รายละเอียด/คะแนน แต่ไม่มีเกณฑ์หรือผลทดสอบกับผู้ใช้เพื่อยืนยันว่าเข้าใจหน้าสรุปได้ทันทีโดยไม่ฝึกอบรม | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
