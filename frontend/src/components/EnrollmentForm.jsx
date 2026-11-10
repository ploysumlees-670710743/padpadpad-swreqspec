import React from 'react';

import { getFieldPresentation } from './enrollmentLabels.js';

// รองรับ: FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01, IF-ENR-02, NFR-USE-01, NFR-REL-01
export default function EnrollmentForm({
  camp,
  formData,
  fieldErrors,
  isSaving,
  onFieldChange,
  onSave,
}) {
  return (
    <form
      className="enrollment-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <header className="camp-intro">
        <p className="eyebrow">แบบฟอร์มสมัครเข้าร่วมกิจกรรม</p>
        <h2>{camp.name}</h2>
        <p>กรอกข้อมูลผู้สมัครและตรวจทานก่อนยืนยันการสมัคร</p>
      </header>

      <section className="form-card" aria-labelledby="applicant-info-heading">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <h3 id="applicant-info-heading">ข้อมูลผู้สมัคร</h3>
            <p>ข้อมูลพื้นฐานสำหรับการสมัครเข้าร่วมค่าย</p>
          </div>
        </div>
        <div className="field-grid">
          {camp.required_fields
            .filter((fieldName) =>
              fieldName !== 'year_level_other' && fieldName !== 'food_allergy_details',
            )
            .map((fieldName) => {
              const presentation = getFieldPresentation(fieldName);
              if (fieldName === 'year_level') {
                return (
                  <label className="field-label" key={fieldName}>
                    <span>{presentation.label}</span>
                    <select
                      name={fieldName}
                      value={formData.year_level ?? ''}
                      aria-invalid={Boolean(fieldErrors[fieldName])}
                      aria-describedby={
                        fieldErrors[fieldName] ? `${fieldName}-error` : undefined
                      }
                      onChange={(event) => onFieldChange(fieldName, event.target.value)}
                    >
                      <option value="">เลือกชั้นปี</option>
                      {['1', '2', '3', '4', '5', '6'].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                      <option value="other">อื่นๆ (ระบุ)</option>
                    </select>
                    {fieldErrors[fieldName] && (
                      <span className="field-error" id={`${fieldName}-error`} role="alert">
                        {fieldErrors[fieldName]}
                      </span>
                    )}
                  </label>
                );
              }
              if (fieldName === 'food_allergy') {
                return (
                  <fieldset
                    className="field-label choice-field"
                    key={fieldName}
                    aria-invalid={Boolean(fieldErrors[fieldName])}
                    aria-describedby={
                      fieldErrors[fieldName] ? `${fieldName}-error` : undefined
                    }
                  >
                    <legend>{presentation.label}</legend>
                    <div className="choice-options">
                      {[['no', 'ไม่มี'], ['yes', 'มี']].map(([value, label]) => (
                        <label className="choice-option" key={value}>
                          <input
                            type="radio"
                            name={fieldName}
                            value={value}
                            checked={formData.food_allergy === value}
                            aria-invalid={Boolean(fieldErrors[fieldName])}
                            onChange={() => onFieldChange(fieldName, value)}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors[fieldName] && (
                      <span className="field-error" id={`${fieldName}-error`} role="alert">
                        {fieldErrors[fieldName]}
                      </span>
                    )}
                  </fieldset>
                );
              }
              return (
                <label className="field-label" key={fieldName}>
                  <span>{presentation.label}</span>
                  <input
                    type={presentation.type}
                    name={fieldName}
                    value={formData[fieldName] ?? ''}
                    aria-invalid={Boolean(fieldErrors[fieldName])}
                    aria-describedby={
                      fieldErrors[fieldName] ? `${fieldName}-error` : undefined
                    }
                    onChange={(event) => onFieldChange(fieldName, event.target.value)}
                  />
                  {fieldErrors[fieldName] && (
                    <span className="field-error" id={`${fieldName}-error`} role="alert">
                      {fieldErrors[fieldName]}
                    </span>
                  )}
                </label>
              );
            })}
          {formData.year_level === 'other' && (
            <label className="field-label" key="year_level_other">
              <span>{getFieldPresentation('year_level_other').label}</span>
              <input
                type="text"
                name="year_level_other"
                value={formData.year_level_other ?? ''}
                aria-invalid={Boolean(fieldErrors.year_level_other)}
                aria-describedby={
                  fieldErrors.year_level_other ? 'year_level_other-error' : undefined
                }
                onChange={(event) => onFieldChange('year_level_other', event.target.value)}
              />
              {fieldErrors.year_level_other && (
                <span className="field-error" id="year_level_other-error" role="alert">
                  {fieldErrors.year_level_other}
                </span>
              )}
            </label>
          )}
          {formData.food_allergy === 'yes' && (
            <label className="field-label allergy-details-field" key="food_allergy_details">
              <span>{getFieldPresentation('food_allergy_details').label}</span>
              <textarea
                name="food_allergy_details"
                value={formData.food_allergy_details ?? ''}
                aria-invalid={Boolean(fieldErrors.food_allergy_details)}
                aria-describedby={
                  fieldErrors.food_allergy_details
                    ? 'food_allergy_details-error'
                    : undefined
                }
                onChange={(event) =>
                  onFieldChange('food_allergy_details', event.target.value)
                }
              />
              {fieldErrors.food_allergy_details && (
                <span
                  className="field-error"
                  id="food_allergy_details-error"
                  role="alert"
                >
                  {fieldErrors.food_allergy_details}
                </span>
              )}
            </label>
          )}
        </div>
      </section>

      <div className="form-actions">
        <span className="draft-hint">บันทึกข้อมูลไว้ก่อน แล้วกลับมาทำต่อได้</span>
        <button className="button button-secondary" type="submit" disabled={isSaving}>
          {isSaving ? 'กำลังบันทึก…' : 'บันทึก Draft'}
        </button>
      </div>
    </form>
  );
}
