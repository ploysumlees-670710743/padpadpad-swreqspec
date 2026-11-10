import React, { useEffect, useState } from 'react';

import { apiClient } from '../api/client.js';
import { getFieldPresentation } from '../components/enrollmentLabels.js';

// รองรับ: CON-ENR-02, NFR-SEC-01
function getErrorMessage(error) {
  return error.status === 401
    ? 'กรุณาเข้าสู่ระบบก่อนตรวจสอบข้อมูลการสมัคร'
    : error.message;
}

// รองรับ: NFR-DATA-01
function formatFieldValue(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function formatApplicationField(fieldName, value) {
  if (fieldName === 'food_allergy') {
    return value === 'no' ? 'ไม่มี' : value === 'yes' ? 'มี' : formatFieldValue(value);
  }
  if (fieldName === 'year_level' && value === 'other') return 'อื่นๆ (ระบุ)';
  return formatFieldValue(value);
}

// รองรับ: FR-ENR-07, NFR-DATA-01, NFR-SEC-01, AC-ENR-05
export default function ApplicantApplicationPage({
  applicationId,
  client = apiClient,
}) {
  const [application, setApplication] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // รองรับ: FR-ENR-07, NFR-DATA-01, NFR-SEC-01, AC-ENR-05
    async function loadApplication() {
      try {
        const response = await client.getApplication(applicationId);
        const savedApplication = await response.json();
        if (active) setApplication(savedApplication);
      } catch (error) {
        if (active) setErrorMessage(getErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadApplication();

    return () => {
      active = false;
    };
  }, [applicationId, client]);

  return (
    <section className="application-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">APPLICATION STATUS</p>
          <h1>ข้อมูลใบสมัคร</h1>
          <p>รายละเอียดใบสมัครและสถานะการตรวจสอบ</p>
        </div>
      </header>
      {errorMessage && <p className="notice notice-error" role="alert">{errorMessage}</p>}
      {isLoading ? (
        <p role="status">กำลังโหลดข้อมูลการสมัคร…</p>
      ) : application ? (
        <>
          {application.status === 'submitted' ? (
            <>
              <ol className="application-steps" aria-label="ขั้นตอนการสมัคร">
                <li className="application-step">
                  <span className="application-step-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 20 4-.8L19 8.2a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z" />
                      <path d="m14.5 6.7 2.8 2.8" />
                    </svg>
                  </span>
                  <span>กรอกใบสมัคร</span>
                </li>
                <li className="application-step">
                  <span className="application-step-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4L22 2Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </span>
                  <span>ส่งใบสมัคร</span>
                </li>
                <li className="application-step application-step-current" aria-current="step">
                  <span className="application-step-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <span>รอตรวจสอบ</span>
                </li>
              </ol>
              <section className="application-success" aria-labelledby="application-success-heading">
                <span className="application-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3.5 2" />
                  </svg>
                </span>
                <h2 id="application-success-heading">ส่งใบสมัครสำเร็จ!</h2>
                <p className="application-status-badge" role="status">รอตรวจสอบ</p>
                <p className="application-success-message">
                  ระบบได้รับใบสมัครของคุณแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบข้อมูล
                </p>
                <dl className="application-status-summary">
                  <div>
                    <dt>สถานะใบสมัคร</dt>
                    <dd>รอตรวจสอบ</dd>
                  </div>
                  <div>
                    <dt>ขั้นตอนถัดไป</dt>
                    <dd>เจ้าหน้าที่ตรวจสอบ</dd>
                  </div>
                </dl>
              </section>
            </>
          ) : (
            <p className="application-status" role="status">{application.status}</p>
          )}
          <section className="application-details-card" aria-labelledby="application-details-heading">
            <h2 id="application-details-heading">รายละเอียดใบสมัคร</h2>
            <dl className="application-details">
              {Object.entries(application.form_data).map(([fieldName, value]) => (
                <React.Fragment key={fieldName}>
                  <dt>{getFieldPresentation(fieldName).label}</dt>
                  <dd>{formatApplicationField(fieldName, value)}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>
        </>
      ) : null}
    </section>
  );
}
