// UC-01 FR-01-01..05, AF-01-01, AC-01: shared Vite API URL convention.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'ไม่สามารถบันทึกข้อมูลได้');
  return result;
}

export const communityClient = {
  locations() {
    return request('/api/locations/assigned');
  },
  list(locationId) {
    return request(`/api/locations/${encodeURIComponent(locationId)}/communities`);
  },
  create(fields) {
    return request('/api/communities', { method: 'POST', body: JSON.stringify(fields) });
  },
  update(communityId, fields) {
    return request(`/api/communities/${encodeURIComponent(communityId)}`, {
      method: 'PUT', body: JSON.stringify(fields),
    });
  },
};
