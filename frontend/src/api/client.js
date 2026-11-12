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
const demoRounds = new Map();
const demoVoterRole = "lecturer";

async function readJsonResponse(response, requestName) {
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
    throw new Error(`${requestName} API returned invalid JSON (${response.status})`, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(body.detail || `${requestName} request failed (${response.status})`);
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
  const response = await fetch(`${API_BASE_URL}/api/applications/me`, {
    credentials: "include",
  });

  return readJsonResponse(response, "Application status");
}

function getDemoRound(roundId) {
  if (!demoRounds.has(roundId)) {
    demoRounds.set(roundId, {
      locations: [],
      hasVoted: false,
    });
  }
  return demoRounds.get(roundId);
}

// Returns the simulated voter's role for the prototype (FR-VOT-02).
export async function getVoteAccess() {
  return { role: demoVoterRole };
}

// Reads prototype locations from the mock API source (FR-VOT-01, FR-VOT-05).
export async function getVoteLocations(roundId) {
  const query = new URLSearchParams({ round_id: roundId });
  const response = await fetch(`${API_BASE_URL}/api/votes/locations?${query}`, {
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Vote locations");
  const round = getDemoRound(roundId);
  round.locations = result.locations.map((location) => ({ ...location }));

  return {
    ...result,
    has_voted: round.hasVoted || result.has_voted,
    locations: round.locations.map((location) => ({ ...location })),
  };
}

// Simulates confirming one location selection and increments its total (FR-VOT-03, FR-VOT-05).
export async function castVote(roundId, locationId) {
  const round = getDemoRound(roundId);
  if (round.hasVoted) {
    throw new Error("ท่านได้ใช้สิทธิ์ไปแล้ว");
  }

  const location = round.locations.find((item) => item.location_id === locationId);
  if (!location) {
    throw new Error("ไม่พบสถานที่ที่เลือก");
  }

  location.total_votes += 1;
  round.hasVoted = true;
  return { total_votes: location.total_votes, has_voted: true };
}

// Resets in-memory prototype state between acceptance-test scenarios.
export function resetVoteDemo() {
  demoRounds.clear();
}
