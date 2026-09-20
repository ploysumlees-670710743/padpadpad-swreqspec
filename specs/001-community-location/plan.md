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
