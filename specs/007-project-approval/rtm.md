# RTM — UC-07 พิจารณาและอนุมัติโครงการ

**อ้างอิง:** `spec.md` Draft v2 → `tasks.md` → Code → `backend/tests/test_AC_07.py`
**CI Evidence:** [GitHub Actions run 43026957350](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43026957350) — **UC-01/UC-07 Backend 18 tests ผ่าน, Offline Prototype 11 tests ผ่าน, Vite Build ผ่าน**; Full backend regression audit เก็บ test ไม่ครบเพราะ 8 collection errors (ดูหัวข้อ 4)
**ข้อห้ามสรุปว่า Verify ครบ:** Spec มี FR ซ้ำและขัดแย้ง; ยังไม่มี end-to-end Auth/Project documents

## 0. Spec conflict — BLOCKER ก่อน Final

หลังหัวข้อ Traceability ใน `spec.md` มีหมวด Functional Requirements ชุดที่สอง ซึ่งเขียน FR-07-01..FR-07-05 ซ้ำด้วยความหมายต่างกัน และเพิ่ม FR-07-06..FR-07-07
- ตารางด้านล่าง **อ้างอิงชุดแรก** ที่อยู่ก่อนหัวข้อ Alternative & Exception Flow
- ไม่แก้หรือออก ID ใหม่แทนทีม; ต้องให้ทีมตัดสินก่อนทำ final RTM
- ข้อกำหนดของชุดที่สอง (รวม FR-07-06/07) ยังไม่ถูกยืนยันเป็น baseline สำหรับ traceability

## 1. Forward Traceability (ชุดแรกที่ใช้อ้างชั่วคราว)

ชื่อย่อ: `P` = `frontend/src/pages/ProjectApprovalPage.jsx`; `API` = `backend/app/api/project_approval.py`; `SVC` = `backend/app/services/project_approval_service.py`; `TEST` = `backend/tests/test_AC_07.py`

| ID | AC | Task | Code ที่ตรวจ | Test / หลักฐาน | สถานะและเหตุผล |
|---|---|---|---|---|---|
| FR-07-01 | AC-07 (ประเมินตอน advisor), ไม่มี AC สำหรับ submit โดยตรง | T-02,T-05 | `P` submit; `SVC.submit` บันทึก pending | `test_AC_07_revision_allows_resubmit_but_rejection_is_terminal` ผ่าน | **ช่องโหว่** — หน้าสรุปโครงการแสดงเพียงชื่อ/สถานะ ยังไม่มีเอกสารโครงการ |
| FR-07-02 | AC-07 (Given) | T-03,T-05 | `P` status/project_name; `API.get_actor` role | ไม่มี test อ่านรายละเอียดเอกสาร | **ช่องโหว่** — อาจารย์ยังดูเอกสารเสนอฉบับเต็มไม่ได้ |
| FR-07-03 | AC-07 | T-03,T-06 | `API.decide_approval`; `SVC.review`; `P` แสดงปุ่มตาม trusted `viewer_role` | `test_AC_07_Given_When_Then_records_decision_history_and_notification[approved]`, `test_AC_07_status_includes_trusted_viewer_role_for_ui_controls` ผ่าน | **ช่องโหว่** — UI รู้ role จาก Backend แล้ว แต่ยังไม่ได้เชื่อม UC-09 Login จริง |
| FR-07-04 | AC-07 (Then) | T-02,T-03,T-04,T-06 | `SVC.review` อัปเดตสถานะและ append history | `test_AC_07_Given_When_Then_records_decision_history_and_notification` ผ่าน 3 ผลลัพธ์ | **ช่องโหว่** — ตรวจผ่านแบบ API isolation แต่ไม่มีระบบ end-to-end |
| FR-07-05 | AC-07 (Then) | T-05 | `API.get_approval_status`; `P` แสดง status; notification endpoint | test ตรวจ notice DB/API ผ่าน | **ช่องโหว่** — UI ยังต้อง refresh เอง; ไม่ได้ verify ว่า committee รับแจ้งเตือนอัตโนมัติ |
| AF-07-01 | AC-07 (revision) | T-04,T-06 | `SVC.review('revision')`, `SVC.submit` ส่งใหม่ | `test_AC_07_revision_allows_resubmit_but_rejection_is_terminal` ผ่าน | **ช่องโหว่** — ยังไม่มีการแก้เนื้อหาโครงการจริงจากระบบ UC ที่เกี่ยวข้อง |
| AF-07-02 | AC-07 (rejected) | T-04,T-06 | `SVC.review('rejected')` terminal | test resubmit rejected returns 409 ผ่าน | **ช่องโหว่** — การยุติโครงการทั้งระบบยังไม่ถูก integrate |
| C-01 | AC-07 (Given) | T-03,T-06 | `API.get_actor` reads trusted auth state | `test_AC_07_unauthenticated_role_fails_closed` ผ่าน | **ช่องโหว่** — รอ UC-09 middleware จริง |
| C-02 | AC-07 (revision) | T-04,T-06 | `SVC.submit` allows resubmit only after revision | `test_AC_07_revision_allows_resubmit_but_rejection_is_terminal` ผ่าน | **ช่องโหว่** — ไม่มีฟอร์มแก้รายละเอียดโครงการในส่วนที่รับผิดชอบ |
| QR-01 | AC-07 (Given) | T-03,T-06 | `SVC._require_member` + `API.get_actor` | `test_AC_07_unauthorized_faculty_cannot_review_other_project` ผ่าน | **ช่องโหว่** — ใช้ dependency override ไม่ใช่ session จริง |
| QR-02 | AC-07 (Then) | T-02,T-06 | `SVC._append_history` + DB triggers ห้าม UPDATE/DELETE | `test_AC_07_audit_log_cannot_be_edited_or_deleted` ผ่าน | **ช่องโหว่** — ยังไม่รัน E2E/ทดสอบ backup/restore |
| ASM-07-01 | AC-07 (Given) | T-03 | `API.get_actor` | `test_AC_07_unauthenticated_role_fails_closed` ผ่าน | **ช่องโหว่** — ยังไม่เชื่อม login service จริง |
| ASM-07-02 | AC-07 (revision) | T-04 | `SVC.submit` + history | `test_AC_07_revision_allows_resubmit_but_rejection_is_terminal` ผ่าน | **ช่องโหว่** — ต้องเชื่อมการแก้ข้อมูลโครงการ |

## 2. Reverse Traceability

| Code/Endpoint | ID จาก Spec | หมายเหตุ |
|---|---|---|
| POST `/api/projects/{id}/approval/submit` | FR-07-01, C-02 | คณะกรรมการส่งและส่งซ้ำหลัง revision |
| POST `/api/projects/{id}/approval` | FR-07-03/04, AF-07-01/02, AC-07, QR-01 | อาจารย์ลงผลพิจารณา; unauthorized forbidden |
| GET `/api/projects/{id}/approval` | FR-07-05, AC-07 | ให้เห็นสถานะและประวัติ |
| GET `/api/projects/{id}/approval/notifications` | FR-07-05, AF-07-01, AC-07 | รายการแจ้งเตือน in-app (ทีมเลือก transport เอง) |
| `uc07_approval_history` immutable triggers | QR-02, FR-07-04 | append-only; ไม่ให้ลบ/แก้ย้อนหลัง |
| `uc07_project_memberships` | QR-01, C-01 | ต้อง provision สิทธิ์จากทีม |
| `frontend/src/api/ucPrototypeClients.js` | AC-07 Prototype | Demo-only; ไม่มีจริง session/auth/DB |

## 3. Findings

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-UC07-01 | Spec conflict | `spec.md` | FR-07-01..05 | มี Functional Requirements สองชุดใช้ ID ซ้ำแต่ต่างความหมาย | |
| F-UC07-02 | Auth integration | `API.get_actor` | C-01, QR-01 | ยังไม่เชื่อม trusted user/role จาก UC-09 | |
| F-UC07-03 | Membership provisioning | `SVC._require_member` | QR-01 | ต้องเชื่อมข้อมูลโครงการ-อาจารย์/คณะกรรมการจริง | |
| F-UC07-04 | Project detail missing | `P` | FR-07-02, AC-07 | อาจารย์เปิดอ่านเอกสารเสนอโครงการฉบับเต็มไม่ได้ | |
| F-UC07-05 | End-to-end unverified | Frontend + Backend | AC-07 | ผ่านเฉพาะ CI feature tests + Build ไม่ได้รัน E2E หรือ pytest ทั้ง Repo | |
| F-UC07-06 | Notification integration | `P` + API | AC-07, FR-07-05 | **แก้บางส่วน:** Demo Mode แสดงแจ้งเตือนหลังพิจารณาทันที; Production UI ของคณะกรรมการยังต้องกดโหลดข้อมูลใหม่เอง ยังไม่ได้เชื่อม real-time notification | |
| F-UC07-07 | Workflow gap | โครงการหลัก | C-02, AF-07-01/02 | ยังไม่เชื่อมหน้าแก้ไขเนื้อหาโครงการและสถานะอื่นของโครงการ | |

## 4. Test execution

- [GitHub Actions Run](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43026957350): `python -m pytest -v backend/tests/test_AC_01.py backend/tests/test_AC_07.py` → **18 passed, 1 warning** (UC-07 9 tests, UC-01 9 tests); Node Offline Demo tests → **11 passed**; Frontend Vite Build → **success**
- Full backend regression audit (ไม่ใช้เป็น gate) พยายามรัน `python -m pytest -v backend/tests` แล้วมี **8 collection errors** ส่วนฟีเจอร์อื่น เช่น `psycopg` / `itsdangerous` ไม่พร้อม และ `bind_session_user` ไม่มีใน middleware ปัจจุบัน; **ยังไม่ใช่หลักฐานว่า full repo ผ่าน**
- ยังไม่ได้รัน Browser E2E, Frontend component tests หรือ integration จริงกับ UC-09
- Q-07-01 multi-tier approval ยังไม่ตัดสิน; ไม่ทำเพิ่ม

ข้อค้นพบทั้งหมด AI เป็นคนตรวจ และอาจหาไม่ครบ ทีมต้องเปิดโค้ดและ spec ยืนยันทีละข้อ แล้วเขียนช่อง 'ทีมตัดสิน' เอง
