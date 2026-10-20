export const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '—';

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      }).toUpperCase()
    : '—';

export const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export const roleLabel = (role) => (role === 'admin' ? 'Base Commander' : 'Supply Officer');
