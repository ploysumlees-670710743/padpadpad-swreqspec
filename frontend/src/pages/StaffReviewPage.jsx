import React, { useEffect, useState } from 'react';

import { getFieldPresentation } from '../components/enrollmentLabels.js';

function formatFieldValue(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function getStatusLabel(application) {
  if (application.status === 'approved') return 'อนุมัติแล้ว';
  if (application.status === 'waitlisted') {
    return `รายชื่อสำรอง ลำดับ ${application.waitlist_position}`;
  }
  if (application.status === 'withdrawn') return 'สละสิทธิ์แล้ว';
  return 'รอตรวจสอบ';
}

// รองรับ: FR-ENR-07, NFR-SEC-01, NFR-REL-01
export default function StaffReviewPage({ client }) {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const response = await client.getReviewApplications();
        const submittedApplications = await response.json();
        if (active) setApplications(submittedApplications);
      } catch (error) {
        if (active) setErrorMessage(error.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadApplications();
    return () => {
      active = false;
    };
  }, [client]);

  async function showApplication(applicationId) {
    setErrorMessage('');
    try {
      const response = await client.getReviewApplication(applicationId);
      setSelectedApplication(await response.json());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="staff-review-page" aria-labelledby="staff-review-heading">
      <header className="page-heading">
        <div>
          <p className="eyebrow">STAFF REVIEW</p>
          <h1 id="staff-review-heading">รายการใบสมัครที่ส่งแล้ว</h1>
          <p>แสดงสถานะใบสมัครใน Demo Mode แบบ Read-only</p>
        </div>
      </header>
      {errorMessage && <p className="notice notice-error" role="alert">{errorMessage}</p>}
      {isLoading ? (
        <p role="status">กำลังโหลดรายการใบสมัคร…</p>
      ) : (
        <div className="staff-review-layout">
          <section className="staff-review-list" aria-label="รายการใบสมัคร">
            {applications.length === 0 ? (
              <p className="staff-review-empty">ยังไม่มีใบสมัครที่ส่งแล้ว</p>
            ) : (
              <ul>
                {applications.map((application) => (
                  <li key={application.application_id}>
                    <button
                      className="staff-review-item"
                      type="button"
                      aria-current={
                        selectedApplication?.application_id === application.application_id
                          ? 'true'
                          : undefined
                      }
                      onClick={() => showApplication(application.application_id)}
                    >
                      <strong>{application.form_data.full_name}</strong>
                      <span>{application.form_data.student_id}</span>
                      <span className={`staff-review-status status-${application.status}`}>
                        {getStatusLabel(application)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {selectedApplication && (
            <section
              className="staff-review-details"
              aria-labelledby="staff-review-details-heading"
            >
              <h2 id="staff-review-details-heading">รายละเอียดใบสมัคร</h2>
              <p
                className={`staff-review-detail-status status-${selectedApplication.status}`}
                role="status"
              >
                {getStatusLabel(selectedApplication)}
              </p>
              <dl className="staff-review-fields">
                {Object.entries(selectedApplication.form_data).map(([fieldName, value]) => (
                  <React.Fragment key={fieldName}>
                    <dt>{getFieldPresentation(fieldName).label}</dt>
                    <dd>{formatFieldValue(value)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
