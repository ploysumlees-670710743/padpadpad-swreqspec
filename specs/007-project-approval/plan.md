# Implementation Plan: UC-07 พิจารณาและอนุมัติโครงการ

**Status:** Draft  
**Spec Reference:** `specs/007-project-approval/spec.md` (v2)  

---

## 1. Executive Summary
แผนการพัฒนาระบบอนุมัติโครงการค่าย สำหรับให้อาจารย์ที่ปรึกษาพิจารณา ตีกลับแก้ไข หรืออนุมัติโครงการ โดยมีระบบบันทึกประวัติการอนุมัติ (Audit Log) และแจ้งเตือนสถานะไปยังคณะกรรมการ

---

## 2. Technical Architecture & Data Design

### Proposed Entities / Data Models
* **Project Approval Model:** ไอดีคำขอ, ไอดีโครงการ (FK), สถานะ (Pending/Approved/Rejected/Revision), ข้อคิดเห็น/เหตุผล, วันเวลาที่อนุมัติ, ไอดีอาจารย์ผู้พิจารณา (FK)
* **Approval History Model:** ประวัติบันทึกการส่งซ้ำและการพิจารณาในแต่ละรอบ

### Component Checklist
- [ ] **UI Layer:** หน้าสำหรับอาจารย์อ่านเอกสารและกดปุ่มอนุมัติ/ตีกลับ และหน้าแสดงสถานะสำหรับคณะกรรมการ
- [ ] **API Layer:** Endpoint `POST /api/projects/{id}/approval`
- [ ] **Notification Layer:** ระบบแจ้งเตือนเมื่อมีการเปลี่ยนสถานะโครงการ

---

## 3. Constraints Checklist

| Constraint ID | Description | Status | Verification Method |
|---|---|---|---|
| **C-01** | ใช้ระบบ Login Session ในการยืนยันตัวตนอาจารย์ผู้พิจารณา (`ASM-07-01`) | Pending | Auth Middleware & Session Check |
| **C-02** | รองรับการแก้ไขข้อมูลและส่งอนุมัติซ้ำเมื่อถูกส่งกลับแก้ไข (`ASM-07-02`) | Pending | State Machine Flow Test |

---

## 4. Open Issues / Dependency to Resolve
* **Q-07-01 Multi-tier Approval:** รอการยืนยันว่าอนาคตต้องมีผู้อนุมัติมากกว่า 1 ท่านหรือไม่

---
## 5. Technology & Integration (team choice, not from spec)

**ทีมเลือกเอง ไม่ได้มาจาก spec:** FastAPI, React + Vite, SQLite within the existing `backend/app/main.py` application. This choice follows existing UC-08/UC-14 code and does not replace the separate PostgreSQL-backed enrollment subsystem.

- Existing `camp_projects` is the master project table (project_id/project_name/status). Approval state is maintained **separately** in `uc07_project_approvals` because `camp_projects.status` currently only permits active/draft/archived.
- Feature-specific `uc07_project_memberships`, `uc07_approval_history`, `uc07_notifications` are initialized by `ProjectApprovalService` without altering the shared `backend/db/schema.sql`.
- UC-09 must inject trusted `request.state.user_id` and `request.state.role`; committee/adviser project membership must be safely provisioned separately. All routes deny unauthorized callers.
- API: POST `/api/projects/{id}/approval/submit` for committee, POST `/api/projects/{id}/approval` for assigned adviser, GET approval status and committee notification list. No multi-tier approval until Q-07-01 is resolved.
- Revision can be resubmitted, rejected is terminal; history inserts cannot be updated/deleted. Notifications are in-app rows, not SMS/Email.
- Frontend: React page via `?feature=project-approval`; shared enrollment UI unchanged.
- **SPEC BLOCKER:** spec.md includes a second copy of functional requirements reusing FR-07-01..FR-07-05 with different meanings. Do not mark RTM fully verified or declare all tasks complete until human resolves duplicated identifiers.
- Integration gap: existing `camp_projects` only has project name/status, so full document/detail review requires team data connection, not guessed extra fields.

## สถานะทบทวน 12 พ.ย. 2026 (ใช้แทนข้อความสถานะปัจจุบันในบันทึกเก่าด้านบน)

ตรวจใน branch ทีม feature/751-uc01-uc07 แล้ว ดู [ผลตรวจรวม](../../docs/srs/UC01-UC07-final-review-20261112.md) สำหรับสิ่งที่ครบและยังขาด บันทึกผล Fork ด้านบนเป็นประวัติ ไม่ใช่ผลปัจจุบัน
มี component tests ใหม่ใน frontend/src/__tests__/uc01_uc07_ui.test.jsx ผ่านสองข้อ (UC-01 บันทึกและข้อความยืนยัน; UC-07 ซ่อนปุ่มอาจารย์จาก committee) และ prototype contract ผ่าน 11 ข้อ; ยังไม่มี Browser E2E หรือ Auth จริง จึงคงสถานะ acceptance ที่ยังไม่ครบไว้
ผล backend ใช้ Actions ของ branch ทีม; ไม่สรุป full suite ผ่านจากชื่อ job สีเขียวเมื่อเป็น non-gating ให้ดูผล diagnostic/counts ในรอบล่าสุด
