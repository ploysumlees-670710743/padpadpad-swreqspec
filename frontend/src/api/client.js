const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const demoRounds = new Map();
const demoVoterRole = "lecturer";

async function readJsonResponse(response, requestName) {
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`${requestName} API returned invalid JSON (${response.status})`, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(body.detail || `${requestName} request failed (${response.status})`);
  }

  return body;
}

// Reads the authenticated student's application summaries (FR-STA-01).
export async function getMyApplication() {
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
