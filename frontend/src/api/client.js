const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const SCHEDULE_API_BASE = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/$/, '')}/schedule`
  : '/api/schedule';

const demoRounds = new Map();
const demoVoterRole = 'lecturer';

// อ่าน JSON และเก็บข้อมูลไว้ใน response.data
// พร้อมเปิดให้เรียก response.locations หรือ response.detail ได้เหมือนเดิม
async function readJsonResponse(response, requestName = 'API') {
  let body = null;

  try {
    const text = await response.text();
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    const parseError = new Error(
      `${requestName} API returned invalid JSON (${response.status})`,
      { cause: error },
    );
    parseError.status = response.status;
    throw parseError;
  }

  if (!response.ok) {
    const error = new Error(
      body?.detail || `${requestName} request failed (${response.status})`,
    );
    error.status = response.status;
    error.errors = Array.isArray(body?.errors) ? body.errors : [];
    throw error;
  }

  response.data = body;

  if (body && typeof body === 'object' && !Array.isArray(body)) {
    Object.assign(response, body);
  }

  return response;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return readJsonResponse(response, 'Schedule');
}

function getFieldValue(record, ...keys) {
  for (const key of keys) {
    if (
      record &&
      Object.prototype.hasOwnProperty.call(record, key) &&
      record[key] !== undefined &&
      record[key] !== null
    ) {
      return record[key];
    }
  }

  return undefined;
}

function normalizeSchedulePayload(payload = {}) {
  return {
    project_id:
      getFieldValue(payload, 'project_id', 'projectId') ?? 'project-001',
    activity_name:
      getFieldValue(payload, 'activity_name', 'activityName') ?? '',
    activity_date:
      getFieldValue(payload, 'activity_date', 'date', 'activityDate') ?? '',
    start_time:
      getFieldValue(payload, 'start_time', 'startTime') ?? '',
    end_time:
      getFieldValue(payload, 'end_time', 'endTime') ?? '',
    location_id:
      getFieldValue(payload, 'location_id', 'locationId') ?? '',
    description:
      getFieldValue(payload, 'description') ?? '',
    facilitator_or_responsible:
      getFieldValue(
        payload,
        'facilitator_or_responsible',
        'responsible',
        'facilitatorOrResponsible',
      ) ?? '',
    checklist_status:
      getFieldValue(payload, 'checklist_status', 'checklistStatus'),
  };
}

// API หลัก: Login, Role Home, สมัครค่าย และ Schedule
export function createApiClient({
  baseUrl = API_BASE_URL,
  fetchImpl = fetch,
} = {}) {
  async function request(path, options = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      credentials: 'include',
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

      if (Array.isArray(body?.errors)) {
        error.errors = body.errors;
      }

      throw error;
    }

    return response;
  }

  const scheduleBase = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/schedule`
    : '/api/schedule';

  return {
    // Login
    login(username, password) {
      return request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    },

    // Role Home
    getRoleHome() {
      return request('/home');
    },

    // Camp enrollment
    getConfiguredCamp() {
      return request('/enrollment/camp');
    },

    getDraft() {
      return request('/applications/draft');
    },

    saveDraft(formData) {
      return request('/applications/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: formData }),
      });
    },

    submitApplication() {
      return request('/applications/submit', { method: 'POST' });
    },

    getApplication(applicationId) {
      return request(
        `/applications/${encodeURIComponent(applicationId)}`,
      );
    },

    getMyApplication() {
      return request('/api/applications/me');
    },

    // Schedule management
    getSchedule() {
      return requestJson(scheduleBase);
    },

    createScheduleActivity(payload) {
      return requestJson(`${scheduleBase}/activities`, {
        method: 'POST',
        body: JSON.stringify(normalizeSchedulePayload(payload)),
      });
    },

    updateScheduleActivity(activityId, payload) {
      return requestJson(
        `${scheduleBase}/activities/${encodeURIComponent(activityId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(normalizeSchedulePayload(payload)),
        },
      );
    },

    deleteScheduleActivity(activityId) {
      return requestJson(
        `${scheduleBase}/activities/${encodeURIComponent(activityId)}`,
        { method: 'DELETE' },
      );
    },

    patchScheduleActivityChecklist(activityId, checklistStatus) {
      return requestJson(
        `${scheduleBase}/activities/${encodeURIComponent(activityId)}/checklist`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            checklist_status: checklistStatus,
          }),
        },
      );
    },
  };
}

export const apiClient = createApiClient();

// Reads the authenticated student's application summaries (FR-STA-01).
export async function getMyApplication() {
  const response = await fetch(`${API_BASE_URL}/api/applications/me`, {
    credentials: 'include',
  });

  return readJsonResponse(response, 'Application status');
}

// Vote prototype state

// Vote prototype state
const demoVoteLocations = [
  {
    location_id: 'location-001',
    name: 'สถานที่ค่าย A',
    image_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    survey_summary: 'สถานที่จำลอง A มีพื้นที่เหมาะสำหรับจัดกิจกรรมและพักผ่อน',
    total_votes: 12,
  },
  {
    location_id: 'location-002',
    name: 'สถานที่ค่าย B',
    image_url:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    survey_summary: 'สถานที่จำลอง B มีบรรยากาศธรรมชาติและพื้นที่กว้างขวาง',
    total_votes: 18,
  },
  {
    location_id: 'location-003',
    name: 'สถานที่ค่าย C',
    image_url:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
    survey_summary: 'สถานที่จำลอง C เหมาะสำหรับกิจกรรมกลุ่มและการเรียนรู้',
    total_votes: 15,
  },
];

// สร้างข้อมูลจำลองแยกตามรอบลงคะแนน
function getDemoRound(roundId) {
  if (!demoRounds.has(roundId)) {
    demoRounds.set(roundId, {
      locations: demoVoteLocations.map((location) => ({
        ...location,
      })),
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

// อ่านรายการสถานที่จากข้อมูลจำลอง ไม่เรียก Backend
export async function getVoteLocations(roundId) {
  const round = getDemoRound(roundId);

  return {
    has_voted: round.hasVoted,
    locations: round.locations.map((location) => ({
      ...location,
    })),
  };
}


// Simulates confirming one location selection and increments its total.
export async function castVote(roundId, locationId) {
  const round = getDemoRound(roundId);

  if (round.hasVoted) {
    throw new Error('ท่านได้ใช้สิทธิ์ไปแล้ว');
  }

  const location = round.locations.find(
    (item) => item.location_id === locationId,
  );

  if (!location) {
    throw new Error('ไม่พบสถานที่ที่เลือก');
  }

  location.total_votes += 1;
  round.hasVoted = true;

  return {
    total_votes: location.total_votes,
    has_voted: true,
  };
}

// Resets in-memory prototype state between acceptance-test scenarios.
export function resetVoteDemo() {
  demoRounds.clear();
}


// Applicant Search and Edit API
async function requestApplicantJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let body = {};

  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const detail = body?.detail;
    const error = new Error(
      typeof detail === 'string'
        ? detail
        : detail?.message || `Applicant API failed (${response.status})`,
    );

    error.status = response.status;
    error.fieldErrors =
      detail?.errors ??
      body?.errors ??
      {};

    throw error;
  }

  return body;
}

// FR-REG-01: ค้นหาด้วยรหัสผู้สมัครหรือชื่อ-นามสกุล
export async function searchApplicants(query) {
  const params = new URLSearchParams({ query: query.trim() });

  return requestApplicantJson(`/applicants/search?${params}`);
}

// FR-REG-01: อ่านข้อมูลผู้สมัครก่อนแก้ไข
export async function getApplicantForEdit(applicantId) {
  return requestApplicantJson(
    `/applicants/${encodeURIComponent(applicantId)}/edit`,
  );
}

// FR-REG-02: ตรวจสอบข้อมูลก่อนบันทึก
export async function validateApplicant(applicantId, changes) {
  return requestApplicantJson(
    `/applicants/${encodeURIComponent(applicantId)}/validate`,
    {
      method: 'POST',
      body: JSON.stringify(changes),
    },
  );
}

// FR-REG-04: บันทึกข้อมูลและประวัติการแก้ไข
export async function updateApplicant(applicantId, changes) {
  return requestApplicantJson(
    `/applicants/${encodeURIComponent(applicantId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(changes),
    },
  );
}

// FR-REG-06: ยกเลิกการแก้ไขและเรียกข้อมูลเดิม
export async function cancelApplicantEdit(applicantId) {
  return requestApplicantJson(
    `/applicants/${encodeURIComponent(applicantId)}/cancel-edit`,
    {
      method: 'POST',
    },
  );
}
