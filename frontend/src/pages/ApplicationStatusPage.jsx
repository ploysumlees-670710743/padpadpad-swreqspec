import { useEffect, useState } from "react";
import { getMyApplication } from "../api/client.js";

// Displays all application summaries returned for the authenticated student (FR-STA-01).
export default function ApplicationStatusPage() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyApplication()
      .then((data) => {
        if (active) setApplications(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main>
        <h1>สถานะการสมัคร</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!applications) {
    return (
      <main>
        <h1>สถานะการสมัคร</h1>
        <p role="status">กำลังโหลดข้อมูล</p>
      </main>
    );
  }

  return (
    <main>
      <h1>รายละเอียดการสมัคร</h1>
      {applications.map((application) => (
        <section key={application.application_id}>
          <dl>
            <dt>สถานะผู้สมัคร</dt>
            <dd>{application.status}</dd>
            <dt>ชื่อค่าย</dt>
            <dd>{application.camp_name}</dd>
            <dt>วัน-เวลาที่จัดกิจกรรม</dt>
            <dd>
              {application.activity_start_at} - {application.activity_end_at}
            </dd>
            <dt>สถานที่จัดค่าย</dt>
            <dd>{application.camp_location}</dd>
            <dt>เอกสารหรือข้อปฏิบัติที่ต้องเตรียมตัว</dt>
            <dd>{application.preparation_info}</dd>
          </dl>
        </section>
      ))}
    </main>
  );
}
