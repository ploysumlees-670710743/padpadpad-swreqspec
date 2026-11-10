import React from 'react';

import { getFieldPresentation } from './enrollmentLabels.js';

function getPreviewValue(fieldName, value) {
  if (fieldName === 'food_allergy') {
    return value === 'no' ? 'ไม่มี' : value === 'yes' ? 'มี' : 'ยังไม่ได้เลือก';
  }
  if (fieldName === 'year_level' && value === 'other') return 'อื่นๆ (ระบุ)';
  return value || 'ยังไม่ได้กรอก';
}

// รองรับ: FR-ENR-02, FR-ENR-04, FR-ENR-06, FR-ENR-07, NFR-SEC-01
export default function EnrollmentPreview({
  camp,
  formData,
  isSubmitting,
  onSubmit,
}) {
  return (
    <section className="preview-card" aria-labelledby="enrollment-preview-heading">
      <div className="section-heading">
        <span className="section-number">02</span>
        <div>
          <h2 id="enrollment-preview-heading">ตัวอย่างข้อมูลก่อนยืนยัน</h2>
          <p>ตรวจทานข้อมูลผู้สมัครก่อนยืนยัน</p>
        </div>
      </div>
      <div className="preview-camp">
        <span>กำลังสมัครเข้าร่วม</span>
        <strong>{camp.name}</strong>
      </div>
      <dl className="preview-list">
        {[
          ...camp.required_fields,
          ...(formData.year_level === 'other' ? ['year_level_other'] : []),
          ...(formData.food_allergy === 'yes' ? ['food_allergy_details'] : []),
        ].map((fieldName) => (
          <div className="preview-row" key={fieldName}>
            <dt>{getFieldPresentation(fieldName).label}</dt>
            <dd>{getPreviewValue(fieldName, formData[fieldName])}</dd>
          </div>
        ))}
      </dl>
      <button
        className="button button-primary submit-button"
        type="button"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? 'กำลังส่งใบสมัคร…' : 'ยืนยันส่งใบสมัคร'}
      </button>
      <p className="submit-hint">ระบบจะตรวจสอบข้อมูลก่อนบันทึกใบสมัคร</p>
    </section>
  );
}
