import React, { useState } from "react";
import { searchApplicants } from "../api/client.js";

export default function ApplicantSearchPage() {
  const [query, setQuery] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState("");

  async function search(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await searchApplicants(query);
      setApplicants(result.applicants);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <h1>ค้นหาผู้สมัคร</h1>
      <form onSubmit={search}>
        <label htmlFor="applicant-search">รหัสผู้สมัครหรือชื่อ-นามสกุล</label>
        <input
          id="applicant-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">ค้นหา</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      <ul>
        {applicants.map((applicant) => (
          <li key={applicant.applicant_id}>
            <a href={`/applicants/${encodeURIComponent(applicant.applicant_id)}/edit`}>
              {applicant.applicant_id} - {applicant.full_name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
