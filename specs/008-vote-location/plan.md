# Plan: UC-08 Vote Location

## ปัญหา
Feature นี้ต้องรองรับการลงคะแนนสถานที่จัดค่ายแบบ 1 คน 1 เสียง ให้ตรวจสิทธิ์จาก Role `lecturer` และ `committee` เท่านั้น พร้อมป้องกันการส่งซ้ำและอัปเดตคะแนนแบบ Real-time โดยยังคงความลับของผู้ลงคะแนนและมีพฤติกรรมเมื่อระบบยืนยันตัวตนขัดข้องชัดเจนตาม spec

## แนวทาง
1. สร้างข้อมูลแบบจำลองการลงคะแนน และตรวจสอบสัญญาในฐานข้อมูลเพื่อคงความเป็นธรรมและหลีกเลี่ยง race condition
2. กำหนดลำดับการทำงานของผู้ใช้จากการเลือกสถานที่จนถึงบันทึกคะแนนและการตอบกลับ HTTP status ที่ชัดเจน
3. ตรวจสอบและบังคับสิทธิ์ผู้ใช้ทั้งระดับหน้า UI และ API พร้อมจัดการกรณี auth central failure
4. กำหนดกลไกแสดงผลคะแนนแบบ Real-time และความปลอดภัยจากการส่งซ้ำแบบ double-submit
5. จัดทำ traceability / acceptance test mapping ให้ครอบคลุม FR และ AC ใน spec

## Todo
- vote-data-model: กำหนด schema / constraints / uniqueness สำหรับการลงคะแนนและสิทธิ์
- vote-workflow: กำหนด main flow, failure flow และ response contract สำหรับ 1-คน-1-เสียง
- vote-authorization: บังคับสิทธิ์หน้า UI + API และจัดการสถานะระบบยืนยันตัวตนขัดข้อง
- vote-realtime: ออกแบบการอัปเดตคะแนนแบบ Real-time และความสอดคล้องกับ secret ballot
- vote-validation: ระบุการตรวจสอบ duplicate submission, HTTP 409/403, และ mapping กับ AC

## ข้อพิจารณา
- ต้องยึด spec เป็นแหล่งความจริง: Role จากฐานข้อมูลระบบ, Real-time ตามคำตอบทีม, และการป้องกันซ้ำด้วย disable button + unique constraint
- Open Question ที่ยังเหลือ: เมื่อคะแนนเท่ากันต้องตัดสินหรือแสดงผลอย่างไร และข้อมูลที่แสดงในรายการสถานที่ต้องมาจากแหล่งใด
- เลือกใช้วิธีการที่สอดคล้องกับ constraints และไม่เพิ่ม requirement ใหม่ นอกเหนือจากที่ทีมเคยตอบแล้ว
