# บันทึกนำงาน UC-01/UC-07 เข้า branch ทีม — 2026-11-12

- ต้นทาง: 670710751-Boonyai/padpadpad-swreqspec, feature/751-uc01-uc07-review-20261111
- ปลายทาง: feature/751-uc01-uc07 ใน repo ทีม; ไม่รวมเข้า main
- แก้จุดชน frontend/src/main.jsx: คง VoteLocationPage เป็นหน้าเริ่มต้นของทีม และเพิ่มหน้า UC-01/UC-07 ผ่าน query feature
- เปิด UC-01: /?feature=community-location
- เปิด UC-07: /?feature=project-approval
- ตั้ง VITE_DEMO_MODE=true เพื่อทดลองข้อมูลจำลอง โดยไม่เชื่อม Login หรือฐานข้อมูลจริง
- ทดสอบ prototype ด้วย Node: ผ่าน 11/11; frontend production build ผ่าน
- ชุดทดสอบ frontend รวมยังติด dependency @testing-library/react ที่ไม่มีใน package ของทีม
- เครื่องนี้เรียก Python ไม่ได้; ผลทดสอบ backend ในการรวมครั้งนี้รอ GitHub Actions
- ข้อกำหนด UC-07 มี FR สองชุดใน spec เดิม ต้องให้ทีมยืนยันตามเอกสาร handoff; ไม่เปลี่ยนข้อกำหนดเอง
