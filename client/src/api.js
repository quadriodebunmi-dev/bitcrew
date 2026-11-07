// Set VITE_API_URL only if the API lives on another origin. Otherwise requests are same-origin
// (Vite proxies /api in development; Express serves everything in production).
const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: BASE ? 'include' : 'same-origin', headers: {} };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, opts);
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(json?.error || `Request failed (${res.status}).`, res.status, json?.fields);
  return json;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload(file, folder = 'general') {
    const form = new FormData();
    form.append('file', file);
    return request(`/admin/upload?folder=${encodeURIComponent(folder)}`, { method: 'POST', form });
  },
  url: (p) => `${BASE}/api${p}`,
};
