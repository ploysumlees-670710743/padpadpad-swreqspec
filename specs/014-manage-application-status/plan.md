# Plan: UC-14 Manage Application Status

## ปัญหา
Feature นี้ต้องรองรับการตรวจสอบสถานะการสมัครของนักศึกษา หลังประกาศผลให้สามารถยืนยันสิทธิ์หรือสละสิทธิ์ได้ภายในช่วงเวลาที่กำหนด พร้อมป้องกันการเข้าถึงข้อมูลที่ไม่ใช่ของตนเอง สร้างประวัติการเปลี่ยนสถานะแบบ audit log และจัดการ deadline แบบอัตโนมัติด้วย scheduled job

## แนวทาง
1. กำหนด state machine และ model สำหรับสถานะใบสมัคร รวมถึงเหตุการณ์เปลี่ยนสถานะและ event audit log
2. ออกแบบ flow การยืนยันสิทธิ์/สละสิทธิ์ พร้อม confirmation dialog, guard condition, และ response codes ที่ชัดเจน
3. บังคับสิทธิ์เจ้าของใบสมัครทั้งระดับหน้า UI และ API เพื่อให้ข้อมูลถูกปิดกั้นจากผู้ใช้อื่น
4. กำหนดกลไก deadline automation ด้วย scheduled job และการตรวจสอบความถูกต้องเรื่อง time zone
5. จัดทำ traceability และ acceptance test mapping ครอบคลุม FR, AC, และ constraints ของ spec

## Todo
- app-status-data-model: กำหนด state, transition, audit log, และการบันทึก timestamp แบบ UTC
- app-status-workflow: กำหนด main flow สำหรับยืนยันสิทธิ์และสละสิทธิ์ พร้อม confirmation dialog
- app-status-authorization: บังคับ owner-only access กับ HTTP 403 และไม่เปิดเผยข้อมูลเมื่อไม่มีสิทธิ์
- app-status-scheduler: ออกแบบ scheduled job ตรวจสอบ deadline ทุกชั่วโมง และเปลี่ยนเป็น “สละสิทธิ์” อัตโนมัติ
- app-status-validation: ระบุการป้องกัน double-action, API 400/409, และ mapping กับ AC

## ข้อพิจารณา
- ต้องยึด spec เป็นแหล่งความจริง: owner-only access, confirmation dialog ก่อนบันทึก, scheduled job ทุกชั่วโมง, และบล็อกทั้ง UI/API สำหรับสถานะสุดท้าย
- Open Question ที่ยังเหลือ: ระยะเวลายืนยันสิทธิ์หลังประกาศผลต้องใช้กี่วัน (ยังต้องถามคณะกรรมการจัดค่าย)
- เลือกใช้วิธีการที่สอดคล้องกับ constraints และไม่เพิ่ม requirement ใหม่ นอกเหนือจากที่ทีมเคยตอบแล้ว
