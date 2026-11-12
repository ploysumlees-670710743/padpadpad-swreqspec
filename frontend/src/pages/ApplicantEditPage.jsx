import React, { useEffect, useState } from "react";
import ApplicantEditForm from "../components/ApplicantEditForm.jsx";
import {
  getApplicantForEdit,
  updateApplicant,
  validateApplicant,
  cancelApplicantEdit,
} from "../api/client.js";
import "../styles/applicant-edit.css";

export default function ApplicantEditPage({ applicantId }) {
  const [applicant, setApplicant] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveResult, setSaveResult] = useState(null);
  const [editing, setEditing] = useState(true);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let active = true;
    getApplicantForEdit(applicantId)
      .then((data) => {
        if (active) setApplicant(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [applicantId]);

  async function save(changes) {
    setSaving(true);
    setSaveError("");
    setFieldErrors({});
    setSaveResult(null);
    try {
      const validation = await validateApplicant(applicantId, changes);
      if (!validation.valid) {
        setFieldErrors(validation.errors);
        setSaveError("กรุณาแก้ไขข้อมูลในช่องที่มีข้อผิดพลาด");
        return;
      }
      const result = await updateApplicant(applicantId, changes);
      setApplicant(result.applicant);
      setSaveResult(result);
    } catch (requestError) {
      setFieldErrors(requestError.fieldErrors ?? {});
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    setCancelError("");
    try {
      const result = await cancelApplicantEdit(applicantId);
      setApplicant(result.applicant);
      setSaveError("");
      setFieldErrors({});
      setSaveResult(null);
      setEditing(false);
    } catch (requestError) {
      setCancelError(requestError.message);
    }
  }

  if (error) {
    return (
      <main className="applicant-edit-page">
        <header className="applicant-edit-header">
          <h1>แก้ไขข้อมูลผู้สมัคร</h1>
        </header>
        <section className="applicant-edit-card">
          <p role="alert" className="form-error">{error}</p>
        </section>
      </main>
    );
  }

  if (!applicant) {
    return (
      <main className="applicant-edit-page">
        <header className="applicant-edit-header">
          <h1>แก้ไขข้อมูลผู้สมัคร</h1>
        </header>
        <section className="applicant-edit-card">
          <p role="status">กำลังโหลดข้อมูล</p>
        </section>
      </main>
    );
  }

  return (
    <main className="applicant-edit-page">
      <header className="applicant-edit-header">
        <h1>แก้ไขข้อมูลผู้สมัคร</h1>
        <p className="applicant-id">รหัสผู้สมัคร: {applicant.applicant_id}</p>
      </header>
      <section className="applicant-edit-card">
        {editing ? (
          <ApplicantEditForm
            applicant={applicant}
            onSubmit={save}
            onCancel={cancel}
            saving={saving}
            saveError={saveError || cancelError}
            fieldErrors={fieldErrors}
            saveResult={saveResult}
          />
        ) : (
          <section className="original-applicant" aria-label="ข้อมูลเดิมของผู้สมัคร">
            <p>ชื่อ-นามสกุล: {applicant.full_name}</p>
            <p>เบอร์โทรศัพท์: {applicant.phone_number}</p>
            <p>อีเมล: {applicant.email}</p>
            <p>ที่อยู่: {applicant.address}</p>
            <p>สถานะ: {applicant.status}</p>
          </section>
        )}
      </section>
    </main>
  );
}
