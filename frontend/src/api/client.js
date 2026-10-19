const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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
