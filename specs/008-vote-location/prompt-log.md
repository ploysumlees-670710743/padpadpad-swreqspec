# Prompt Log: UC-08 ลงคะแนนและสรุปผลสถานที่

## 2026-11-13 08:28 UTC: /verify specs/008-vote-location/
- Backend full suite (`cd backend && pytest -v`): 108 passed, 27 failed, 1 warning; UC-08 backend tests 8 passed, 0 failed
- Frontend full suite (`cd frontend && npm test`): 40 passed, 13 failed จาก 53; UC-08 tests 3 passed, 3 failed โดย AC-VOT-01 UI tests ทั้ง 3 กรณีไม่ผ่าน
- ผล test UC-08 ที่ไม่ผ่าน: `test_AC_VOT_01_vote_page_select_and_confirm`, `test_AC_VOT_01_loads_simulated_locations_without_calling_the_backend`, `test_tied_top_scores_show_all_tied_locations_without_selecting_a_winner`
- ตารางตามรอยไปข้างหน้า: 12 แถว — ครบ 1, ยังไม่ถึง 0, รอ Q 0, ช่องโหว่ 11
- ข้อค้นพบใหม่: F-08; F-01 ถึง F-07 ยังคงพบ
- ไม่แก้ code, tests, spec, plan หรือ tasks; แก้เฉพาะ rtm.md และเพิ่มบันทึกนี้

## 2026-11-13 08:38 UTC: /implement T-02 specs/008-vote-location/tasks.md
- ตรวจ T-02 หลังทีมเปลี่ยนสถานะเป็น “พร้อมทำ”; T-01 อยู่สถานะ “เสร็จ”
- โค้ด API/service ที่ task ระบุมีอยู่แล้ว: อ่าน identity จาก trusted request state, ใช้ transaction บันทึก eligibility และ anonymous ballot และคืน HTTP 200 พร้อม `total_votes`/`has_voted`
- เพิ่ม AC test ใน `backend/tests/test_AC_VOT_01.py` โดยคง test `test_TC_VOT_01_1_api_records_vote_and_updates_total` เดิมไว้
- ผลทดสอบเฉพาะที่ได้รับอนุญาต (`pytest -v tests/test_AC_VOT_01.py tests/test_vote_task_t01.py`): 5 passed, 1 warning
- เปลี่ยนสถานะ T-02 เป็น “เสร็จ รอทีมตรวจ”
- ไฟล์ที่แก้: `backend/tests/test_AC_VOT_01.py`, `specs/008-vote-location/tasks.md`, `specs/008-vote-location/prompt-log.md`
- ไม่ต้องตัดสินใจแทนทีม; ขออนุญาตก่อนรัน pytest หลังคำสั่ง shell ก่อนหน้าถูกปฏิเสธ
