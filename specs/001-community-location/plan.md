# Implementation Plan: UC-01 บันทึกข้อมูลสถานที่และชุมชน

**Status:** Draft  
**Spec Reference:** `specs/001-community-location/spec.md` (v2)  

---

## 1. Executive Summary
แผนการพัฒนาระบบสำหรับจัดการข้อมูลชุมชนและผู้ดูแลพื้นที่ โดยเน้นการสร้าง UI ฟอร์มบันทึกข้อมูล การเชื่อมโยงข้อมูลกับสถานที่ค่าย และการจำกัดสิทธิ์การแก้ไขข้ามค่ายตามข้อกำหนดความปลอดภัย

---

## 2. Technical Architecture & Data Design

### Proposed Entities / Data Models
* **Location Model:** ไอดีสถานที่, ชื่อสถานที่, อำเภอ/จังหวัด
* **Community Model:** ไอดีชุมชน, ไอดีสถานที่ (FK), ชื่อชุมชน, ข้อปฏิบัติ (Text), ชื่อผู้ดูแล, เบอร์โทรศัพท์ติดต่อ

### Component Checklist
- [ ] **UI Layer:** หน้าฟอร์มกรอกข้อมูลชุมชน และตารางแสดงรายการชุมชนแยกตามค่าย
- [ ] **API Layer:** Endpoint สำหรับ `POST /api/communities` และ `GET /api/locations/{id}/communities`
- [ ] **Security Layer:** Middleware ตรวจสอบสิทธิ์การแก้ไขข้อมูลเฉพาะค่ายที่ได้รับมอบหมาย (`ASM-01-01`)

---

## 3. Constraints Checklist

| Constraint ID | Description | Status | Verification Method |
|---|---|---|---|
| **C-01** | ต้องจำกัดสิทธิ์คณะกรรมการไม่ให้แก้ไขข้อมูลข้ามค่ายได้ (`ASM-01-01`) | Pending | Unit Test & RBAC Middleware |
| **C-02** | รองรับข้อมูลข้อปฏิบัติ (local rules) เป็นประเภท Text เท่านั้น (`Q-01-02`) | Pending | UI Input Textarea |

---

## 4. Open Issues / Dependency to Resolve
* **Q-01-01 Validation Rules:** หากมีการยืนยันรูปแบบเบอร์โทรหรือกฎห้ามชื่อซ้ำจากอาจารย์ จะต้องเพิ่ม Validation Logic ใน API Layer ในภายหลัง

---
## 5. Technology & Integration (team choice, not from spec)

**ทีมเลือกเอง ไม่ได้มาจาก spec:** React 18 + Vite 6 (existing frontend); Python FastAPI + SQLite (existing UC-08/UC-14 application at `backend/app/main.py`). Another existing enrollment backend uses PostgreSQL; we are **not** replacing or modifying it. Integration into a single production database is a separate team decision.

- Persistence: `backend/app/services/community_location_service.py` manages feature-scoped tables `uc01_communities` and `uc01_community_assignments`, referencing existing `camp_locations`. It does not mutate the shared `backend/db/schema.sql`.
- API: POST `/api/communities`, GET `/api/locations/{id}/communities`, PUT `/api/communities/{community_id}` (the edit capability is required by C-01).
- Auth: `request.state.user_id` and `request.state.role` must be populated by a trusted middleware from UC-09; **no request body/user ID header is trusted**. Until integration the feature denies access (fail closed).
- Assignment provisioning is a dependency on team authentication/management; users cannot self-assign locations via this API.
- UI: `?feature=community-location` reaches the React page without rewriting the shared enrollment flow.
- AC-01 fields: community_name, caretaker_name, contact_phone required; caretaker_title and local_rules optional (because AC-01 does not make them mandatory).
- Q-01-01 / Q-01-02 remain unresolved; no guessed phone regex, duplicate names, or attachment upload.
- Verification: `pytest -v backend/tests/test_AC_01.py` then all project tests; measure QR-01 against real deployment.
