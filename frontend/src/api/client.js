const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function readJson(response, action) {
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`${action} returned invalid JSON (${response.status})`, {
      cause: error,
    });
  }

  if (!response.ok) {
    const detail = body.detail;
    const message = typeof detail === "string" ? detail : `${action} failed (${response.status})`;
    const error = new Error(message);
    if (detail && typeof detail === "object" && detail.errors) {
      error.fieldErrors = detail.errors;
    }
    throw error;
  }

  return body;
}

// Reads an applicant's existing editable details (FR-REG-01).
export async function getApplicantForEdit(applicantId) {
  const response = await fetch(`${API_BASE_URL}/applicants/${encodeURIComponent(applicantId)}/edit`, {
    credentials: "include",
  });
  return readJson(response, "Applicant edit request");
}

// Saves edited applicant details and receives the audit result (FR-REG-04, FR-REG-05).
export async function updateApplicant(applicantId, changes) {
  const response = await fetch(`${API_BASE_URL}/applicants/${encodeURIComponent(applicantId)}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });
  return readJson(response, "Applicant update request");
}

// Validates edited applicant details before saving (FR-REG-02, FR-REG-03).
export async function validateApplicant(applicantId, changes) {
  const response = await fetch(
    `${API_BASE_URL}/applicants/${encodeURIComponent(applicantId)}/validate`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    },
  );
  return readJson(response, "Applicant validation request");
}

// Cancels editing and returns the original applicant (FR-REG-06).
export async function cancelApplicantEdit(applicantId) {
  const response = await fetch(
    `${API_BASE_URL}/applicants/${encodeURIComponent(applicantId)}/cancel-edit`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  return readJson(response, "Applicant cancel edit request");
}

// Reads the authenticated student's application summaries (FR-STA-01).
export async function getMyApplication() {
  const response = await fetch(`${API_BASE_URL}/api/applications/me`, {
    credentials: "include",
  });

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`Application status API returned invalid JSON (${response.status})`, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(body.detail || `Application status request failed (${response.status})`);
  }

  return body;
}
