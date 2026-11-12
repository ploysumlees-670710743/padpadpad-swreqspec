import React, { useEffect, useState } from 'react';
import { mockEnrollmentClient } from '../api/mockEnrollmentClient.js';

import { apiClient } from '../api/client.js';
import EnrollmentForm from '../components/EnrollmentForm.jsx';
import EnrollmentPreview from '../components/EnrollmentPreview.jsx';

// รองรับ: CON-ENR-02, NFR-SEC-01
function getErrorMessage(error) {
  if (error.status === 401) return 'กรุณาเข้าสู่ระบบก่อนดำเนินการสมัคร';
  if (
    error.status === 422 &&
    error.errors?.some((validationError) => typeof validationError.field_name === 'string')
  ) {
    return 'ข้อมูลไม่ครบถ้วน กรุณาแก้ไขช่องที่ระบุ';
  }
  if (error.status === 422) return 'ส่งใบสมัครไม่สำเร็จ กรุณาตรวจสอบข้อผิดพลาดที่แสดง';
  return error.message;
}

// รองรับ: FR-ENR-03, NFR-USE-01
function getFieldErrors(errors) {
  return errors.reduce((result, error) => {
    if (typeof error.field_name === 'string' && typeof error.error_message === 'string') {
      result[error.field_name] = error.error_message;
    }
    return result;
  }, {});
}

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, FR-ENR-05
function assertCampRequirements(camp) {
  if (!Array.isArray(camp.required_fields)) {
    throw new Error('ข้อมูลค่ายหรือข้อกำหนดฟอร์มจากระบบไม่ถูกต้อง');
  }
}

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-06, FR-ENR-07, CON-ENR-01, CON-ENR-02, NFR-USE-01, NFR-SEC-01
// export default function CampEnrollmentPage({ client = apiClient, onSubmitted }) {
const defaultClient =
  import.meta.env.VITE_ENROLLMENT_MOCK === 'true'
    ? mockEnrollmentClient
    : apiClient;

export default function CampEnrollmentPage({
  client = defaultClient,
  onSubmitted,
}) {
  const [camp, setCamp] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEnrollment() {
      try {
        const campResponse = await client.getConfiguredCamp();
        const configuredCamp = await campResponse.json();
        assertCampRequirements(configuredCamp);
        if (active) setCamp(configuredCamp);

        const draftResponse = await client.getDraft();
        if (draftResponse.status === 404) {
          if (active) setNotice('ยังไม่มี Draft สามารถเริ่มกรอกข้อมูลได้');
          return;
        }

        const draft = await draftResponse.json();
        if (active) {
          setFormData(draft.form_data);
          setNotice('โหลด Draft ที่บันทึกไว้แล้ว');
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getErrorMessage(error));
          setCamp(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadEnrollment();

    return () => {
      active = false;
    };
  }, [client]);

  // รองรับ: FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-05
  function handleFieldChange(fieldName, value) {
    setFormData((current) => {
      const next = { ...current, [fieldName]: value };
      if (fieldName === 'year_level' && value !== 'other') {
        delete next.year_level_other;
      }
      if (fieldName === 'food_allergy' && value !== 'yes') {
        delete next.food_allergy_details;
      }
      return next;
    });
    setFieldErrors((current) => {
      const next = { ...current };
      [fieldName,
        ...(fieldName === 'year_level' && value !== 'other' ? ['year_level_other'] : []),
        ...(fieldName === 'food_allergy' && value !== 'yes'
          ? ['food_allergy_details']
          : []),
      ].forEach((name) => delete next[name]);
      return next;
    });
  }

  // รองรับ: FR-ENR-02, CON-ENR-02, NFR-SEC-01
  async function handleSaveDraft() {
    if (!camp) return;
    setIsSaving(true);
    setErrorMessage('');
    setNotice('');

    try {
      await client.saveDraft(formData);
      const savedResponse = await client.getDraft();
      const savedDraft = await savedResponse.json();

      setFormData(savedDraft.form_data);
      setNotice('บันทึก Draft แล้ว');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  // รองรับ: FR-ENR-06, FR-ENR-07
  async function handleSubmitApplication() {
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});
    setNotice('');

    try {
      await client.saveDraft(formData);
      const response = await client.submitApplication();
      const application = await response.json();
      if (typeof application.application_id !== 'string' || !application.application_id.trim()) {
        throw new Error('ส่งใบสมัครแล้ว แต่ระบบไม่ได้ส่งรหัสใบสมัครกลับมา');
      }
      if (onSubmitted) {
        onSubmitted(application.application_id);
        return;
      }
      setIsSubmitted(true);
      setNotice('รอตรวจสอบ');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setFieldErrors(getFieldErrors(error.errors ?? []));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="enrollment-page">
      {client === mockEnrollmentClient && (
        <p className="notice notice-info" role="status">
          โหมดทดลอง (Mock Mode) — ข้อมูลจำลองเท่านั้น
          การบันทึกและการส่งใบสมัครไม่ได้เชื่อมต่อระบบจริง
        </p>
      )}
      <header className="page-heading">
        <div>
          <p className="eyebrow">CAMP ENROLLMENT</p>
          <h1>สมัครเข้าร่วมค่าย</h1>
          <p>กรอกข้อมูลผู้สมัครเพื่อส่งใบสมัครเข้าร่วมค่าย</p>
        </div>
      </header>
      {errorMessage && <p className="notice notice-error" role="alert">{errorMessage}</p>}
      {notice && (
        <p className={`notice ${notice === 'รอตรวจสอบ' ? 'notice-success' : 'notice-info'}`} role="status">
          {notice}
        </p>
      )}
      {isLoading ? (
        <p role="status">กำลังโหลดข้อมูลการสมัคร…</p>
      ) : camp ? (
        <>
          {!isSubmitted && (
            <div className="enrollment-layout">
              <EnrollmentForm
                camp={camp}
                formData={formData}
                fieldErrors={fieldErrors}
                isSaving={isSaving}
                onFieldChange={handleFieldChange}
                onSave={handleSaveDraft}
              />
              <EnrollmentPreview
                camp={camp}
                formData={formData}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitApplication}
              />
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
