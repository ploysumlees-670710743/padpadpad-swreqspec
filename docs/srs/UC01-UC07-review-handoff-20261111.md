# UC-01 / UC-07 — ส่งต่อทีมตรวจ (11 พฤศจิกายน 2026)

> สถานะ: เอกสารส่งต่อเพื่อการ Review เท่านั้น ไม่ใช่ SRS Final หรือหลักฐานว่าทั้งระบบ Integration ผ่าน
>
> เจ้าของส่วนงาน: วรเมธ (ตาม `specs/README.md`)
>
> **ทำงานอยู่ใน Fork:** `670710751-Boonyai/padpadpad-swreqspec`
>
> **Branch ตรวจงาน:** `feature/751-uc01-uc07-review-20261111` (แยกจาก `feature/751-uc01-uc07-combined`)
>
> **ยังไม่ได้ Merge** เข้า `main` ของ Fork หรือ Repo ทีม

## 1. สิ่งที่มีแล้ว (แยกตาม UC)

| สิ่งส่ง | UC-01 | UC-07 |
|---|---|---|
| Feature Specification | `specs/001-community-location/spec.md` Draft v2 | `specs/007-project-approval/spec.md` Draft v2 (มี FR ซ้ำ รอทีมยืนยัน) |
| Plan | `specs/001-community-location/plan.md` | `specs/007-project-approval/plan.md` |
| Tasks / Test Cases / RTM | มีแล้วในโฟลเดอร์ฟีเจอร์ | มีแล้วในโฟลเดอร์ฟีเจอร์ |
| Backend REST / Services | `backend/app/api/communities.py`, `backend/app/services/community_location_service.py` | `backend/app/api/project_approval.py`, `backend/app/services/project_approval_service.py` |
| Frontend | `frontend/src/pages/CommunityLocationPage.jsx` | `frontend/src/pages/ProjectApprovalPage.jsx` |
| ส่วน SRS | `docs/srs/UC01-UC07-SRS-contribution.md` (ร่าง) | ไฟล์เดียวกัน (ร่าง) |
| Scoped tests | `backend/tests/test_AC_01.py` | `backend/tests/test_AC_07.py` |

## 2. ความสามารถของต้นแบบปัจจุบัน

**UC-01:** คณะกรรมการโหลดรายการสถานที่ค่ายที่ได้รับมอบหมาย (GET `/api/locations/assigned`), เลือกค่าย, ดูรายการชุมชน, บันทึก/แก้ไขชื่อชุมชน ข้อมูลผู้ดูแล เบอร์โทร และข้อปฏิบัติ กรองสิทธิ์ข้ามค่ายที่ Backend; โหมด Demo ใช้ข้อมูลในหน่วยความจำเท่านั้น

**UC-07:** คณะกรรมการส่งโครงการ/ส่งอีกครั้งหลังถูกส่งกลับแก้ไข; อาจารย์พิจารณาอนุมัติ/ไม่อนุมัติ/ส่งแก้ไข; บันทึกสถานะ ประวัติแบบแก้ย้อนหลังไม่ได้ และแจ้งเตือนในแอปไปยังคณะกรรมการ; UI แสดงปุ่มตาม Viewer Role ที่ Backend ส่งจาก trusted session; Demo แสดงการสลับหน้าที่แบบจำลองเท่านั้น

หน้าทดลอง (เปิดจาก `frontend/` หลัง `npm ci`):
- `http://localhost:5173/?feature=community-location`
- `http://localhost:5173/?feature=project-approval`

Windows PowerShell ที่โฟลเดอร์หลัก:
```powershell
npm --prefix frontend ci
$env:VITE_DEMO_MODE="true"
npm --prefix frontend run dev
```
Demo Mode **ไม่มี Auth จริง ไม่บันทึก DB จริง**; ห้ามใช้เป็นหลักฐานแทน Integration

## 3. ข้อที่ต้องให้เจ้าของ Spec / ทีมตัดสิน (Blocker)

1. **UC-07 FR ID ซ้ำ**: `spec.md` มี Functional Requirements ชุดแรก และชุดที่สองหลัง Traceability โดยใช้ `FR-07-01..05` ซ้ำคนละความหมาย ต้องให้ทีมตกลง Baseline ก่อนแก้เลข/ข้อความและ RTM ห้าม AI เดาแทน
2. **UC-07 เอกสารโครงการ**: สคีมาปัจจุบันใน `camp_projects` มี `project_id`, `project_name`, `status` แต่ยังไม่มีแหล่งเอกสารฉบับเต็มหรือ Contract สำหรับหน้ารายละเอียดโครงการ (`FR-07-02`, `AC-07`) ให้ทีมระบุเจ้าของข้อมูล/URL/สิทธิ์การเข้าถึงและวิธีส่งกลับแก้ไข
3. **UC-09 Login / Role Integration**: ต้องเชื่อม Middleware ที่กำหนด `request.state.user_id` และ `request.state.role` โดยเชื่อถือได้ รวมทั้งการกำหนดค่ายให้คณะกรรมการ และการผูกอาจารย์กับโครงการโดยผู้มีสิทธิ์เท่านั้น
4. **UC-01 Q-01-01 / Q-01-02**: กฎรูปแบบเบอร์/ชื่อชุมชนซ้ำ และไฟล์แนบข้อปฏิบัติชุมชน ยังรอคำตอบ อย่าตั้งกฎเอง
5. **UC-07 Q-07-01**: อนุมัติหลายระดับอยู่ใน Open Question; ยังไม่อยู่ใน Prototype
6. **Prototype 6 Features**: ให้ทีมยืนยันว่าจะนับ UC-01 และ UC-07 เป็น 2 จาก 6 ฟีเจอร์ที่ต้องสาธิตหรือไม่ รวมทั้งตัวเลือกอีก 4 รายการ

## 4. การทดสอบและข้อจำกัด

- GitHub Actions ของ Fork รัน Backend Test เฉพาะ UC-01 และ UC-07, Node built-in test ของ Offline Prototype และ Vite Build
- ตรวจผลรอบล่าสุดที่ GitHub Actions ของ Branch โดยตรง: [Workflow](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/workflows/verify-uc01-uc07.yml)
- มี full backend regression audit แบบ **non-gating** แยกจาก scoped tests; ดูผลจริงใน GitHub Actions ก่อนสรุป
- ยังไม่มี browser E2E ที่เชื่อม UC-09 จริง, UI usability measurement, การวัด UC-01 เวลา 2 วินาทีในสภาพแวดล้อมเป้าหมาย หรือการทดลองเอกสารโครงการจริง
- `specs/001-community-location/rtm.md` และ `specs/007-project-approval/rtm.md` แสดงรายการช่องโหว่และช่อง “ทีมตัดสิน”

## 5. ก่อนส่งเข้า Repo ทีม

1. ให้ทีมเลือก Baseline FR ใน UC-07 และ Contract เอกสารโครงการ/ข้อมูลสิทธิ์
2. ตรวจ `spec.md` ↔ `tasks.md` ↔ `test-cases.md` ↔ `rtm.md` ของสอง UC ให้ตรงกัน (ไม่เพิ่ม FR/AC ใหม่เอง)
3. ทดลองหน้า Demo ด้วยคนจริง และทดสอบข้ามฟีเจอร์/สิทธิ์หลัง UC-09 พร้อม
4. รวบรวม SRS และ Traceability Matrix ฉบับกลุ่ม; ไม่ยืนยันสถานะเพื่อนอีก 12 UC โดยดูแค่ index
5. สร้าง Pull Request จาก Fork ไป Repo ทีม **เมื่อผู้รับผิดชอบพร้อมให้ Review** เท่านั้น; ไม่ Merge โดยพลการ

## 6. ผลตรวจ Integration กับ Repo ทีม (11 พฤศจิกายน 2026)

- Fork Branch ปัจจุบันและ `main` ของทีม **แยกประวัติกันแล้ว**: เมื่อเปรียบเทียบกับทีม ฝั่งงานเรามี commit เพิ่ม 33 และตามหลังทีม 11 commit (ค่านี้เปลี่ยนได้เมื่อทีม push ใหม่)
- เมื่อเทียบ `main` ของทีมกับฐานของ Fork พบไฟล์ที่ **ทั้งสองฝั่งเปลี่ยนเหมือนกัน** 2 ไฟล์: `backend/app/main.py` และ `frontend/src/main.jsx` ต้องรวมอย่างระมัดระวังเพื่อไม่ให้ route/import ของฟีเจอร์เพื่อนหาย
- **ห้าม** นำ `main.jsx` หรือ `backend/app/main.py` ของ Fork ไปเขียนทับไฟล์จาก Repo ทีมตรง ๆ โดยไม่เทียบ Diff
- ยังไม่ได้ทำ rebase/merge ทีมเข้ามาใน Branch นี้ และยังไม่ได้เปิด PR

### Full regression audit (ใช้เพื่อหาปัญหา ไม่ใช่ผลผ่าน)

GitHub Actions [run 43026957350](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43026957350):
- Scoped UC-01/07 Backend: **18 passed**
- Offline Prototype Node tests: **11 passed**
- Vite Build: **success**
- Whole-backend pytest: **8 collection errors** (ยังเริ่ม suite ได้ไม่ครบ) เนื่องจาก `psycopg` และ `itsdangerous` ไม่อยู่ใน environment นี้ และ `backend.app.middleware.auth` ไม่เปิดเผยฟังก์ชัน `bind_session_user` ที่ test UC อื่นคาดหวัง
- งานตรวจ Full Suite ตั้ง `continue-on-error` โดยตั้งใจเพื่อไม่ให้การทดลองนี้บล็อก scoped CI; **Workflow สีเขียวไม่ได้หมายถึง Full Suite ผ่าน**
- ห้ามแก้ requirements/บริการของเพื่อนแบบเดาเอง ให้ทีมเจ้าของฟีเจอร์แก้ Contract และ dependency ที่ตกลงร่วมกัน
