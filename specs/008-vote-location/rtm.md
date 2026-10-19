# RTM: ลงคะแนนและสรุปผลสถานที่
อ้างอิง: [spec.md](./spec.md) Draft v2 | [tasks.md](./tasks.md) | [test-cases.md](./test-cases.md)
สร้างด้วย /verify เมื่อ 2026-10-19 | test: 10 ผ่าน 0 ไม่ผ่าน (fallback จาก repo root); คำสั่ง `cd backend && pytest -v` เก็บ test ไม่สำเร็จ 5 collection errors; `cd frontend && npm test` ไม่มี test script

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VOT-01 | AC-VOT-01 | T-03, T-08 (T-08 รอ Q-02) | ยังไม่มี API รายการสถานที่หรือหน้าลงคะแนน | ไม่มี | รอ Q-02 |
| FR-VOT-02 | AC-VOT-03 | T-06, T-07 | `backend/app/services/vote_service.py: VoteService.cast_vote` ตรวจ `vote_eligible_users`; `backend/app/api/votes.py: cast_vote` แปลงผู้ไม่มีสิทธิ์เป็น 403 | `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่านเฉพาะผู้มีสิทธิ์; test ปฏิเสธผู้ไม่มีสิทธิ์ยังไม่มี | ยังไม่ถึง |
| FR-VOT-03 | AC-VOT-01 | T-02, T-03 | `backend/app/api/votes.py: cast_vote`; `backend/app/services/vote_service.py: VoteService.cast_vote` บันทึก location ที่รับมา | `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่านสำหรับ API; UI selection ยังไม่มี | ยังไม่ถึง |
| FR-VOT-04 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `backend/db/schema.sql: vote_eligibility`; `VoteService.cast_vote` บันทึกสถานะสิทธิ์และตรวจการใช้สิทธิ์ซ้ำ | `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot` และ `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่าน; ยังไม่มี test ส่งซ้ำผ่าน API | ยังไม่ถึง |
| FR-VOT-05 | AC-VOT-01 | T-02, T-03, T-08 | `VoteService.cast_vote` คำนวณยอดในรอบ/สถานที่และ API ตอบ `total_votes`; ยังไม่มีการเผยแพร่ผลให้ผู้ดูรายอื่นแบบ Real-time | `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่านการตรวจยอดตอบกลับ; ไม่มี test Real-time | ยังไม่ถึง |
| FR-VOT-06 | AC-VOT-02 | T-04, T-05 | `VoteService.cast_vote` ปฏิเสธผู้ใช้ที่ใช้สิทธิ์แล้ว; `backend/app/api/votes.py: cast_vote` ส่ง HTTP 409 และข้อความตาม FR | ไม่มี test AC-VOT-02 | ยังไม่ถึง |
| NFR-PERF-01 | AC-VOT-01, AC-VOT-02 | T-02, T-04 | `backend/app/services/vote_service.py: VoteService.cast_vote` ใช้ SQLite lock timeout 5 วินาที; ไม่มีตัววัด p95 | ไม่มี performance test; พบ F-01 และ F-02 | ช่องโหว่ |
| NFR-SEC-01 | AC-VOT-02 | T-01, T-02, T-04, T-05 | `vote_eligibility` มี primary key ต่อ user/round; `VoteService.cast_vote` ใช้ `BEGIN IMMEDIATE` และตรวจสถานะซ้ำ | test T-01 ตรวจ uniqueness/rollback; ไม่มี test concurrent submission หรือ duplicate API | ยังไม่ถึง |
| NFR-USE-01 | AC-VOT-01 | T-03 | ยังไม่มีหน้าลงคะแนน/สรุปผล | ไม่มี UI test | ยังไม่ถึง |
| CON-SEC-01 | AC-VOT-03 | T-06, T-07 | `get_authenticated_voter_id` อ่าน `request.state.user_id` และปฏิเสธเมื่อไม่มี identity; ไม่มีตัวเชื่อมระบบกลางใน repo | ไม่มี test ต่อ auth จริง; test AC-VOT-01 override dependency | ยังไม่ถึง |
| CON-TECH-01 | AC-VOT-01, AC-VOT-02 | T-01, T-02, T-04 | `VoteService.cast_vote` ใช้ SQLite transaction (`BEGIN IMMEDIATE`); schema ใช้ primary key ต่อ user/round | `test_t01_sqlite_vote_transaction_rolls_back_ballot_write` และ AC-VOT-01 ผ่าน; ยังไม่มีการทดสอบ race condition ของการส่งจริง | ยังไม่ถึง |
| CON-DATA-01 | AC-VOT-01 | T-01, T-02 | ตาราง `vote_eligibility` แยกจาก `vote_ballots`; ballot มี round/location แต่ไม่มี voter ID | `test_t01_schema_enforces_one_right_per_user_and_round_and_separates_ballot` และ `test_TC_VOT_01_1_api_records_vote_and_updates_total` ผ่าน | ครบ |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/api/votes.py: POST /api/votes` (`cast_vote`) | FR-VOT-03, FR-VOT-04, FR-VOT-05, CON-DATA-01 | บางส่วน | รับ `round_id`/`location_id`, ไม่รับ voter ID ใน body และส่งยอดรวมกลับ; ยังไม่มี API อ่าน/กระจายยอดแบบ Real-time |
| `backend/app/api/votes.py: VoteRequest` | FR-VOT-03, CON-DATA-01 | สอดคล้องกับสัญญาที่ผู้ใช้ยืนยัน | มี `round_id` และ `location_id`; ไม่มีตัวระบุผู้โหวตใน request |
| `backend/app/api/votes.py: VoteResponse` | FR-VOT-05 | สอดคล้องกับสัญญาที่ผู้ใช้ยืนยัน | คืน `total_votes` และ `has_voted` |
| `backend/app/api/votes.py: get_authenticated_voter_id` | CON-SEC-01 | บางส่วน | fail closed และข้อความ auth failure ตรง spec; ไม่มี trusted middleware เชื่อมระบบกลางใน workspace |
| `backend/app/api/votes.py: get_vote_service` | CON-TECH-01 | สอดคล้อง | สร้าง service ที่ใช้ฐานข้อมูล SQLite |
| `backend/app/services/vote_service.py: VoteService.initialize` | FR-VOT-04, CON-DATA-01 | สอดคล้อง | สร้างตารางจาก schema |
| `backend/app/services/vote_service.py: VoteService.cast_vote` | FR-VOT-02, FR-VOT-03, FR-VOT-04, FR-VOT-05, CON-TECH-01, CON-DATA-01 | บางส่วน | ตรวจ role ต่อรอบ, transaction, uniqueness และนับยอด; location ยังไม่ถูกตรวจว่าผ่านเกณฑ์จากแหล่งข้อมูลที่รอ Q-02 |
| `backend/db/schema.sql: vote_eligible_users` | FR-VOT-02 | สอดคล้องบางส่วน | แยก role lecturer/committee ต่อรอบ; ไม่มีการเชื่อมกับฐานข้อมูลกลางจริงใน repo |
| `backend/db/schema.sql: vote_eligibility` | FR-VOT-04, NFR-SEC-01 | สอดคล้อง | primary key บังคับหนึ่งแถวต่อ user/round |
| `backend/db/schema.sql: vote_ballots` | CON-DATA-01 | สอดคล้อง | ballot ไม่มีคอลัมน์ voter identity |
| `backend/app/main.py: lifespan` | FR-VOT-04, CON-DATA-01 | สอดคล้องด้าน initialize | initialize schema; ไม่ได้ต่อระบบกลางหรือทำงาน UI |
| `backend/app/models/vote.py: VoteEligibility`, `VoteBallot` | FR-VOT-04, CON-DATA-01 | สอดคล้อง | model แยกสิทธิ์กับ ballot; ไม่มี endpoint/UI เพิ่มจาก model |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | ตัวเลขไม่ตรง spec | `backend/app/services/vote_service.py: VoteService.cast_vote` | NFR-PERF-01 | ตั้ง SQLite lock timeout เป็น 5 วินาที ทั้งที่ spec กำหนดเวลาประมวลผลบันทึกไม่เกิน 2 วินาที p95; timeout นี้อาจทำให้คำขอรอเกินเกณฑ์ | |
| F-02 | test อ่อน | ไม่มี performance test สำหรับ T-02 | NFR-PERF-01 | T-02 ถูกทำเครื่องหมายเสร็จ แต่ไม่มีผลวัด p95 หรือ test ยืนยันเกณฑ์ 2 วินาที จึงยังยืนยัน NFR ไม่ได้ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
