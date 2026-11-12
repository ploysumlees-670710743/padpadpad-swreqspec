# RTM — UC-01 บันทึกข้อมูลสถานที่และชุมชน

**อ้างอิง:** `spec.md` Draft v2 (ความจริงหนึ่งเดียว) → `tasks.md` → Code → `backend/tests/test_AC_01.py`
**ตรวจโค้ด:** GitHub Actions [run 43025058889](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43025058889) (11 พ.ย. 2026) — **UC-01/07 Backend รวม 17 tests ผ่าน; Demo contract 11 tests ผ่าน; Frontend Build ผ่าน** (เฉพาะชุดนี้ ไม่ใช่ full-repo/E2E)
**ขอบเขตการตรวจ:** เฉพาะ feature tests และ build เท่านั้น **ยังไม่ได้รัน pytest ทั้งโปรเจกต์หรือ E2E ที่เชื่อม Login/DB จริง**

## 1. Forward Traceability

ไฟล์ย่อ: `P` = `frontend/src/pages/CommunityLocationPage.jsx`; `API` = `backend/app/api/communities.py`; `SVC` = `backend/app/services/community_location_service.py`; `TEST` = `backend/tests/test_AC_01.py`

| ID | AC | Task | Code / พฤติกรรมที่ตรวจได้ | Test / หลักฐาน | สถานะและเหตุผล |
|---|---|---|---|---|---|
| FR-01-01 | AC-01 (Given) | T-05 | `P`: มีหน้าจัดการข้อมูลชุมชน; `main.jsx` เชื่อม query route | Vite Build ผ่าน; ยังไม่มี UI assertion | **ช่องโหว่** — ยังไม่มี UI test ว่าเข้าหน้าจัดการได้จริง |
| FR-01-02 | AC-01 (Given) | T-01,T-04,T-05 | `P`: เลือกค่ายจากรายการที่ได้รับมอบหมาย; `API`: GET assigned + GET communities | `test_AC_01_FR_01_02_lists_only_assigned_locations` ผ่าน; `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่าน | **บางส่วน** — UI เลือกค่ายได้จากรายการของตนแล้ว แต่ยังต้องเชื่อม identity/assignment จริงจาก UC-09 |
| FR-01-03 | ไม่มี AC ตรวจ local rules โดยตรง | T-01,T-02,T-03,T-05 | `P` textarea; `SVC` เก็บ local_rules เป็น TEXT | `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่าน (ตรวจค่า local_rules) | **ช่องโหว่** — FR ยังไม่มี AC รองรับส่วน local rules โดยตรง |
| FR-01-04 | AC-01 | T-01,T-03,T-05 | `P` ชื่อ/ตำแหน่ง/เบอร์; `SVC`: จัดเก็บผู้ดูแล | `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่าน (ตรวจชื่อ/เบอร์) | **ช่องโหว่** — AC และ test ยังไม่ assert ตำแหน่งผู้ดูแล |
| FR-01-05 | AC-01 (When/Then) | T-03,T-05,T-06 | `API`: create_community; `P` แสดงข้อความยืนยัน | `test_AC_01_Given_When_Then_persists_community_linked_to_camp` ผ่าน; Build ผ่าน | **ช่องโหว่** — ยังไม่มี end-to-end UI assertion ข้อความยืนยัน |
| AF-01-01 | ไม่มี AC แยก | T-03,T-05,T-06 | `API` Pydantic validator ปฏิเสธค่าว่าง; `P` แสดงข้อความ | `test_AC_01_AF_01_01_rejects_required_field_without_saving` ผ่าน 4 ชุดข้อมูล | **ช่องโหว่** — ยังไม่มี AC สำหรับกรณีผิดพลาดโดยเฉพาะ |
| C-01 | AC-01 (Given), แต่ไม่ตรวจ unauthorized | T-01,T-03,T-04,T-06 | `API`: get_committee_user_id; `SVC`: require_assignment | `test_AC_01_C_01_cross_camp_denied_for_create_read_update` ผ่าน | **ช่องโหว่** — test override ตัวตน; ยังไม่ผูก UC-09 Authentication จริง |
| C-02 | ไม่มี AC โดยตรง | T-01,T-05,T-06 | `SVC`: local_rules TEXT; `P`: textarea | save/query local_rules ผ่าน | **ช่องโหว่** — เพิ่ม AC ครอบคลุมชนิดข้อมูลหรือยืนยันว่าทดสอบร่วมใน AC-01 พอแล้ว |
| QR-01 | ไม่มี AC ความเร็ว | T-06 | `API` save request | ยังไม่มี performance test 2 วินาทีในสภาพแวดล้อมจริง | **ยังไม่ถึง** |
| QR-02 | ไม่มี AC การใช้งาน | T-05,T-06 | `P`: label/required/error | Vite Build ผ่าน; ไม่มี usability test | **ช่องโหว่** — เกณฑ์ 'ใช้งานง่าย' ยังวัดไม่ได้ |
| ASM-01-01 | AC-01 (Given) | T-01,T-03,T-04 | `SVC`: require_assignment ตาม user/location | `test_AC_01_C_01_cross_camp_denied_for_create_read_update` ผ่าน | **ช่องโหว่** — ต้อง provision สิทธิ์จริงจากทีม |

## 2. Reverse Traceability

| จุด Implement | อ้างกลับไปยัง Spec | ผลตรวจ |
|---|---|---|
| GET `/api/locations/assigned` | FR-01-02, C-01 | แสดงเฉพาะสถานที่ค่ายที่สมาชิกคณะกรรมการได้รับมอบหมาย; ยังรอ UC-09 เชื่อมตัวตนจริง |
| GET `/api/locations/{id}/communities` | FR-01-01, FR-01-02, C-01 | แสดงรายการตาม location ที่ได้รับสิทธิ์; เป็น API ตาม plan |
| POST `/api/communities` | FR-01-03..05, AF-01-01, AC-01 | เพิ่มชุมชนและผู้ดูแล; required fields ตาม AC |
| PUT `/api/communities/{id}` | C-01 (สิทธิ์แก้ไขข้อมูล), Scope บริหารจัดการ | ใช้แก้ข้อมูลตาม location เดิม; ให้ทีมยืนยันวิธีแก้ไขใน UI |
| `uc01_community_assignments` | C-01, ASM-01-01 | เป็น technical choice สำหรับกำหนดสิทธิ์; ยังไม่มี integration จาก UC-09 |
| `frontend/src/api/ucPrototypeClients.js` | Prototype AC-01 | **Demo-only** อยู่ในความจำ ไม่ส่งข้อมูลจริง; ไม่ถือเป็น Backend production |

## 3. Findings (ต้องให้ทีมตัดสิน)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-UC01-01 | Integration pending | API Auth | C-01 | ยังไม่มี middleware UC-09 เติม trusted request.state.user_id / role | |
| F-UC01-02 | Dependency pending | assignment DB | C-01 | ต้อง provision user/location โดยทีมอย่างปลอดภัย | |
| F-UC01-03 | Performance | QR-01 | QR-01 | ยังไม่ยืนยันการตอบสนองภายใน 2 วินาทีของระบบจริง | |
| F-UC01-04 | Open Questions | spec.md | Q-01-01, Q-01-02 | เบอร์โทร/ชื่อซ้ำ/ไฟล์แนบยังไม่มีคำตอบ | |
| F-UC01-05 | FR ไม่มี AC ครบ | spec.md | FR-01-03, FR-01-04 | ข้อมูล local rules และตำแหน่งผู้ดูแลไม่ได้ระบุใน AC-01 | |
| F-UC01-06 | UI test gap | Prototype | FR-01-01, FR-01-05, QR-02 | Build ผ่าน แต่ยังไม่มี UI test ว่าผู้ใช้เลือกค่ายและเห็นข้อความยืนยันจริง | |
| F-UC01-07 | UX ambiguity | CommunityLocationPage.jsx | FR-01-02 | **แก้ใน Fork review branch แล้ว:** UI เลือกได้จากรายการที่ API กรองตาม assignment; รอทีมตรวจ UI กับ UC-09 จริง | |

## 4. Tests และข้อจำกัดการ Verify

- GitHub Actions: [รอบแก้ไข 11 พ.ย. 2026](https://github.com/670710751-Boonyai/padpadpad-swreqspec/actions/runs/43025058889) — **Backend 17 ผ่าน** (UC-01 จำนวน 9, UC-07 จำนวน 8), **Demo contract 11 ผ่าน**, Vite Build ผ่าน
- ไม่มี full repo pytest / end-to-end UC-09 / usability / performance report
- ไม่ถือว่า RTM รายการสถานะ 'ช่องโหว่' ได้รับการแก้แล้วเพียงเพราะ Test ผ่าน

ข้อค้นพบทั้งหมด AI เป็นคนตรวจ และอาจหาไม่ครบ ทีมต้องเปิดโค้ดและ spec ยืนยันทีละข้อ แล้วเขียนช่อง 'ทีมตัดสิน' เอง
