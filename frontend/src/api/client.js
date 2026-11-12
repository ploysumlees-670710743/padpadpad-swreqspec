const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const SCHEDULE_API_BASE = API_BASE_URL ? `${API_BASE_URL}/schedule` : '/api/schedule';

function getFieldValue(record, ...keys) {
  for (const key of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function normalizeSchedulePayload(payload = {}) {
  return {
    project_id: getFieldValue(payload, 'project_id', 'projectId') ?? 'project-001',
    activity_name: getFieldValue(payload, 'activity_name', 'activityName') ?? '',
    activity_date: getFieldValue(payload, 'activity_date', 'date', 'activityDate') ?? '',
    start_time: getFieldValue(payload, 'start_time', 'startTime') ?? '',
    end_time: getFieldValue(payload, 'end_time', 'endTime') ?? '',
    location_id: getFieldValue(payload, 'location_id', 'locationId') ?? '',
    description: getFieldValue(payload, 'description') ?? '',
    facilitator_or_responsible: getFieldValue(
      payload,
      'facilitator_or_responsible',
      'responsible',
      'facilitatorOrResponsible',
    ) ?? '',
    checklist_status: getFieldValue(payload, 'checklist_status', 'checklistStatus'),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  let body;
  try {
    body = await response.json();
  } catch (error) {
    body = { detail: `Request returned invalid JSON (${response.status})` };
  }

  const wrappedResponse = response;
  wrappedResponse.data = body;
  if (body && typeof body === 'object') {
    Object.assign(wrappedResponse, body);
  }

  if (!response.ok) {
    const error = new Error(body?.detail || `Request failed (${response.status})`);
    error.status = response.status;
    error.errors = Array.isArray(body?.errors) ? body.errors : [];
    throw error;
  }

  return wrappedResponse;
}

// Reads the authenticated student's application summaries (FR-STA-01).
export async function getMyApplication() {
  return requestJson(`${API_BASE_URL}/api/applications/me`);
}

export const apiClient = {
  getSchedule() {
    return requestJson(SCHEDULE_API_BASE);
  },

  createScheduleActivity(payload) {
    return requestJson(`${SCHEDULE_API_BASE}/activities`, {
      method: 'POST',
      body: JSON.stringify(normalizeSchedulePayload(payload)),
    });
  },

  updateScheduleActivity(activityId, payload) {
    return requestJson(`${SCHEDULE_API_BASE}/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(normalizeSchedulePayload(payload)),
    });
  },

  deleteScheduleActivity(activityId) {
    return requestJson(`${SCHEDULE_API_BASE}/activities/${activityId}`, {
      method: 'DELETE',
    });
  },

  patchScheduleActivityChecklist(activityId, checklistStatus) {
    return requestJson(`${SCHEDULE_API_BASE}/activities/${activityId}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify({
        checklist_status: checklistStatus,
      }),
    });
  },
};
