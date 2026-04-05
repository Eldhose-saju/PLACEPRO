// =============================================================================
// API Helper — Centralized fetch wrapper for Flask backend
// =============================================================================
// All API calls go through this module. Automatically attaches JWT token.
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper that:
 * 1. Prepends the API base URL
 * 2. Attaches Authorization header if a token exists in localStorage
 * 3. Sets Content-Type to JSON for POST/PUT requests
 * 4. Parses and returns the JSON response
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach JWT token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// ─── Auth API ───
export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data: { name: string; email: string; password: string; phone: string; cgpa: number; skills: string }) =>
    apiFetch('/register', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Student API ───
export const studentAPI = {
  getAll: () => apiFetch('/students'),
  getById: (id: number) => apiFetch(`/students/${id}`),
  getProfile: () => apiFetch('/profile'),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/students/${id}`, { method: 'DELETE' }),
};

// ─── Company API ───
export const companyAPI = {
  getAll: () => apiFetch('/companies'),
  create: (data: { name: string; location: string }) =>
    apiFetch('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/companies/${id}`, { method: 'DELETE' }),
};

// ─── Job API ───
export const jobAPI = {
  getAll: () => apiFetch('/jobs'),
  create: (data: { company_id: number; role: string; min_cgpa: number; salary: number }) =>
    apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
};

// ─── Application API ───
export const applicationAPI = {
  apply: (job_id: number) =>
    apiFetch('/apply', { method: 'POST', body: JSON.stringify({ job_id }) }),
  getAll: () => apiFetch('/applications'),
  updateStatus: (id: number, status: string) =>
    apiFetch(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Report API ───
export const reportAPI = {
  getPlacements: () => apiFetch('/reports/placements'),
  getStatistics: () => apiFetch('/reports/statistics'),
  getAuditLog: () => apiFetch('/reports/audit-log'),
};
