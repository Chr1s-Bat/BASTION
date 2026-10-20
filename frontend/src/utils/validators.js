// Small client-side validators. Each returns an error string, or '' when valid.
export const required = (v, label = 'This field') =>
  v === null || v === undefined || String(v).trim() === '' ? `${label} is required.` : '';

export const minLen = (v, n, label = 'This field') =>
  String(v || '').trim().length < n ? `${label} must be at least ${n} characters.` : '';

export const isEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()) ? '' : 'Enter a valid email address.';

export const intRange = (v, min, max, label = 'Value') => {
  const n = Number(v);
  if (v === '' || v === null || v === undefined) return `${label} is required.`;
  if (!Number.isInteger(n)) return `${label} must be a whole number.`;
  if (n < min) return `${label} must be at least ${min}.`;
  if (max !== undefined && n > max) return `${label} must not exceed ${max}.`;
  return '';
};

/** Run a { field: () => error } map and return only the failing fields. */
export function validate(rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, check]) => {
    const msg = check();
    if (msg) errors[field] = msg;
  });
  return errors;
}
