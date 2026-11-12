// UC-07 AC-07, C-01: share existing Vite API base and cookie session.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function send(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : 'ไม่สามารถดำเนินการได้');
  return body;
}

function pathFor(projectId) {
  return `/api/projects/${encodeURIComponent(projectId)}/approval`;
}

export const projectApprovalClient = {
  status(projectId) { return send(pathFor(projectId)); },
  submit(projectId) { return send(pathFor(projectId) + '/submit', { method: 'POST' }); },
  decide(projectId, decision, feedback) {
    return send(pathFor(projectId), {
      method: 'POST', body: JSON.stringify({ decision, feedback }),
    });
  },
  notifications(projectId) { return send(pathFor(projectId) + '/notifications'); },
};
