import axios from 'axios';

export const TOKEN_KEY = 'bastion_token';

// One shared Axios instance: base URL + Bearer token interceptor.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 anywhere (except on the login/register calls) ends the session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/login') && !url.includes('/register')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('bastion:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Turn any Axios error into { message, fields } for forms and toasts. */
export function parseError(error) {
  if (!error.response) {
    return {
      message: 'Cannot reach the BASTION API. Check that the Laravel server is running.',
      fields: {},
    };
  }
  const { status, data } = error.response;
  const fields = {};
  if (status === 422 && data?.errors) {
    Object.entries(data.errors).forEach(([key, msgs]) => {
      fields[key] = Array.isArray(msgs) ? msgs[0] : msgs;
    });
  }
  const fallback = {
    401: 'Session expired. Please sign in again.',
    403: 'Access denied. You do not have clearance for this action.',
    404: 'The requested record was not found.',
    422: 'Please correct the highlighted fields.',
    429: 'Too many attempts. Stand by and try again shortly.',
  }[status] || 'Unexpected system fault. Try again.';
  return { message: data?.message || fallback, fields, status };
}

export default api;
