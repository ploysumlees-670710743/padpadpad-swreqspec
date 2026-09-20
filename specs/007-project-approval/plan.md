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
