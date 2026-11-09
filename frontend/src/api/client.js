const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-06, FR-ENR-07, FR-STA-01
export function createApiClient({ baseUrl = API_BASE_URL, fetchImpl = fetch } = {}) {
  // รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-06, FR-ENR-07, FR-STA-01
  async function request(path, options = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      credentials: "include",
      ...options,
    });

    if (!response.ok) {
      let body;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      const error = new Error(
        body?.detail || `API request failed with status ${response.status}.`,
      );
      error.status = response.status;
      if (Array.isArray(body?.errors)) error.errors = body.errors;
      throw error;
    }

    return response;
  }

  return {
    getConfiguredCamp() {
      return request("/enrollment/camp");
    },
    getDraft() {
      return request("/applications/draft");
    },
    saveDraft(formData) {
      return request("/applications/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_data: formData }),
      });
    },
    submitApplication() {
      return request("/applications/submit", { method: "POST" });
    },
    getApplication(applicationId) {
      return request(`/applications/${encodeURIComponent(applicationId)}`);
    },
    getMyApplication() {
      return request("/api/applications/me");
    },
  };
}

export const apiClient = createApiClient();

// Reads the authenticated student's application summaries (FR-STA-01).
export async function getMyApplication() {
  const response = await apiClient.getMyApplication();

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Application status API returned invalid JSON (${response.status})`, {
      cause: error,
    });
  }
}
