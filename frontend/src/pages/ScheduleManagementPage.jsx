import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { apiClient } from '../api/client.js';
import ActivityForm, { createEmptyActivityForm } from '../components/ActivityForm.jsx';
import ActivityTable from '../components/ActivityTable.jsx';

function normalizeActivityFields(activity = {}) {
  return {
    activity_name: activity.activity_name ?? activity.activityName ?? '',
    activity_date: activity.activity_date ?? activity.date ?? '',
    start_time: activity.start_time ?? activity.startTime ?? '',
    end_time: activity.end_time ?? activity.endTime ?? '',
    location_id: activity.location_id ?? activity.locationId ?? '',
    description: activity.description ?? '',
    facilitator_or_responsible: activity.facilitator_or_responsible ?? activity.responsible ?? '',
  };
}

function getFieldErrorMessage(error) {
  const detailMessage = error?.detail || error?.message || '';
  if (error?.status === 401) return 'กรุณาเข้าสู่ระบบก่อนจัดการตารางกิจกรรม';
  if (detailMessage) return detailMessage;
  if (error?.status === 422) return 'ข้อมูลไม่ครบถ้วนหรือมีค่าที่ไม่ถูกต้อง กรุณาตรวจสอบฟิลด์ที่แสดง';
  return 'เกิดข้อผิดพลาดในการบันทึกกิจกรรม';
}

function getFieldErrors(error) {
  const detailMessage = error?.detail || error?.message || '';
  const normalizedDetail = String(detailMessage).toLowerCase();
  if (!normalizedDetail || (!normalizedDetail.includes('overlap') && !normalizedDetail.includes('ซ้อนทับ'))) {
    return {};
  }

  return {
    location_id: 'สถานที่นี้ซ้อนทับกับกิจกรรมที่มีอยู่แล้ว',
    start_time: 'ช่วงเวลาเริ่มและสิ้นสุดซ้อนทับกับกิจกรรมที่มีอยู่แล้ว',
    end_time: 'ช่วงเวลาเริ่มและสิ้นสุดซ้อนทับกับกิจกรรมที่มีอยู่แล้ว',
  };
}

export default function ScheduleManagementPage({ client = apiClient }) {
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState(createEmptyActivityForm());
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await client.getSchedule();
      const payload = response?.data ?? (await response.json());
      const nextActivities = Array.isArray(payload?.activities) ? payload.activities : [];
      setActivities(nextActivities);
    } catch (error) {
      setErrorMessage(getFieldErrorMessage(error));
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const isEditing = useMemo(() => Boolean(editingActivityId), [editingActivityId]);

  function handleFieldChange(fieldName, value) {
    setFormData((current) => ({ ...current, [fieldName]: value }));
    setFieldErrors((current) => ({ ...current, [fieldName]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const values = {
      ...formData,
      activity_name: formData.activity_name?.trim(),
      activity_date: formData.activity_date?.trim(),
      start_time: formData.start_time?.trim(),
      end_time: formData.end_time?.trim(),
      location_id: formData.location_id?.trim(),
      description: formData.description?.trim(),
      facilitator_or_responsible: formData.facilitator_or_responsible?.trim(),
    };

    if (
      !values.activity_name ||
      !values.activity_date ||
      !values.start_time ||
      !values.end_time ||
      !values.location_id ||
      !values.description ||
      !values.facilitator_or_responsible
    ) {
      setErrorMessage('กรุณากรอกข้อมูลทุกฟิลด์ให้ครบถ้วน');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      if (editingActivityId) {
        await client.updateScheduleActivity(editingActivityId, values);
      } else {
        await client.createScheduleActivity(values);
      }
      setFormData(createEmptyActivityForm());
      setEditingActivityId(null);
      setFieldErrors({});
      await loadSchedule();
    } catch (error) {
      const nextFieldErrorMap = getFieldErrors(error);
      setFieldErrors(nextFieldErrorMap);
      setErrorMessage(getFieldErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(activity) {
    setEditingActivityId(activity.activity_id ?? activity.activityId);
    setFormData(normalizeActivityFields(activity));
    setErrorMessage('');
    setFieldErrors({});
  }

  async function handleDelete(activityId) {
    if (!activityId) return;

    try {
      await client.deleteScheduleActivity(activityId);
      await loadSchedule();
      setFieldErrors({});
    } catch (error) {
      const nextFieldErrorMap = getFieldErrors(error);
      setFieldErrors(nextFieldErrorMap);
      setErrorMessage(getFieldErrorMessage(error));
    }
  }

  async function handleToggleStatus(activity) {
    const activityId = activity.activity_id ?? activity.activityId;
    const nextStatus = activity.checklist_status === 'Done' ? 'Pending' : 'Done';

    try {
      await client.patchScheduleActivityChecklist(activityId, nextStatus);
      await loadSchedule();
      setFieldErrors({});
    } catch (error) {
      const nextFieldErrorMap = getFieldErrors(error);
      setFieldErrors(nextFieldErrorMap);
      setErrorMessage(getFieldErrorMessage(error));
    }
  }

  return (
    <section className="schedule-management-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">SCHEDULE MANAGEMENT</p>
          <h1>จัดการตารางกิจกรรม</h1>
          <p>เพิ่ม แก้ไข ลบ และติดตามสถานะ checklist ของกิจกรรมย่อย</p>
        </div>
      </header>

      {errorMessage && <p className="notice notice-error" role="alert">{errorMessage}</p>}

      <div className="panel">
        <h2>{isEditing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h2>
        <ActivityForm
          formData={formData}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
          isEditing={isEditing}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingActivityId(null);
            setFormData(createEmptyActivityForm());
            setFieldErrors({});
          }}
        />
      </div>

      <div className="panel">
        <h2>ตารางกิจกรรม</h2>
        {isLoading ? (
          <p role="status">กำลังโหลดตารางกิจกรรม…</p>
        ) : (
          <ActivityTable
            activities={activities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </section>
  );
}
