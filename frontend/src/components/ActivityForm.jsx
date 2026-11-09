import React from 'react';

const defaultForm = {
  activity_name: '',
  activity_date: '',
  start_time: '',
  end_time: '',
  location_id: '',
  description: '',
  facilitator_or_responsible: '',
};

export function createEmptyActivityForm() {
  return { ...defaultForm };
}

export default function ActivityForm({
  formData = defaultForm,
  fieldErrors = {},
  isSaving = false,
  isEditing = false,
  onFieldChange,
  onSubmit,
  onCancel,
}) {
  const handleChange = (fieldName) => (event) => {
    onFieldChange(fieldName, event.target.value);
  };

  const renderField = (fieldName, label, inputProps) => {
    const errorText = fieldErrors[fieldName];
    return (
      <label className={errorText ? 'field-with-error' : ''}>
        <span>{label}</span>
        <input
          {...inputProps}
          aria-invalid={Boolean(errorText)}
          aria-describedby={errorText ? `${fieldName}-error` : undefined}
        />
        {errorText && (
          <small id={`${fieldName}-error`} className="field-error-message" aria-live="polite">
            {errorText}
          </small>
        )}
      </label>
    );
  };

  return (
    <form onSubmit={onSubmit} className="schedule-form">
      <div className="form-grid">
        {renderField('activity_name', 'ชื่อกิจกรรม', {
          name: 'activity_name',
          value: formData.activity_name ?? '',
          onChange: handleChange('activity_name'),
          placeholder: 'เช่น พิธีเปิด',
          required: true,
        })}

        {renderField('activity_date', 'วันที่', {
          type: 'date',
          name: 'activity_date',
          value: formData.activity_date ?? '',
          onChange: handleChange('activity_date'),
          required: true,
        })}

        {renderField('start_time', 'เวลาเริ่ม', {
          type: 'time',
          name: 'start_time',
          value: formData.start_time ?? '',
          onChange: handleChange('start_time'),
          required: true,
        })}

        {renderField('end_time', 'เวลาเสร็จ', {
          type: 'time',
          name: 'end_time',
          value: formData.end_time ?? '',
          onChange: handleChange('end_time'),
          required: true,
        })}

        {renderField('location_id', 'สถานที่', {
          name: 'location_id',
          value: formData.location_id ?? '',
          onChange: handleChange('location_id'),
          placeholder: 'loc-001',
          required: true,
        })}

        {renderField('facilitator_or_responsible', 'ผู้รับผิดชอบ', {
          name: 'facilitator_or_responsible',
          value: formData.facilitator_or_responsible ?? '',
          onChange: handleChange('facilitator_or_responsible'),
          placeholder: 'ชื่อผู้รับผิดชอบ',
          required: true,
        })}
      </div>

      <label className="full-width">
        <span>รายละเอียด</span>
        <textarea
          name="description"
          value={formData.description ?? ''}
          onChange={handleChange('description')}
          rows={4}
          placeholder="อธิบายรายละเอียดกิจกรรม"
          required
        />
      </label>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            ยกเลิก
          </button>
        )}
        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกกิจกรรม'}
        </button>
      </div>
    </form>
  );
}
