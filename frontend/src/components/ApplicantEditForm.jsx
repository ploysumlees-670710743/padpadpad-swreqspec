import React, { useEffect, useState } from "react";

const EDITABLE_FIELDS = [
  ["full_name", "ชื่อ-นามสกุล"],
  ["phone_number", "เบอร์โทรศัพท์"],
  ["email", "อีเมล"],
  ["address", "ที่อยู่"],
  ["status", "สถานะ"],
];

export default function ApplicantEditForm({
  applicant,
  onSubmit,
  onCancel,
  saving,
  saveError,
  fieldErrors = {},
  saveResult,
}) {
  const [values, setValues] = useState(applicant);

  useEffect(() => {
    setValues(applicant);
  }, [applicant]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="applicant-edit-form" onSubmit={submit}>
      {EDITABLE_FIELDS.map(([field, label]) => (
        <div className="applicant-field" key={field}>
          <label htmlFor={field}>{label}</label>
          <input
            id={field}
            name={field}
            value={values[field] ?? ""}
            onChange={updateField}
            aria-invalid={Boolean(fieldErrors[field])}
            aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
          />
          {fieldErrors[field] ? (
            <p className="field-error" id={`${field}-error`} role="alert">
              {fieldErrors[field]}
            </p>
          ) : null}
        </div>
      ))}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก" : "ยืนยัน"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          ยกเลิก
        </button>
      </div>
      {saveError ? <p className="form-error" role="alert">{saveError}</p> : null}
      {saveResult ? (
        <p className="save-success" role="status">บันทึกข้อมูลและประวัติการเปลี่ยนแปลงแล้ว</p>
      ) : null}
    </form>
  );
}
