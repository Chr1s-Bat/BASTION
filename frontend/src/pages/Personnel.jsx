import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Search, Star, Users, X } from 'lucide-react';
import { userService } from '../services/bastion';
import { parseError } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import { FormSelect } from '../components/FormInput';
import { EmptyState, ErrorState, Loader } from '../components/Feedback';
import { fmtDate, roleLabel } from '../utils/format';

/** Admin-only page: hidden from officers in React and blocked by role:admin in Laravel. */
export default function Personnel() {
  const [rows, setRows] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, per_page: 10 };
    if (debounced) params.search = debounced;
    if (role) params.role = role;
    userService.list(params)
      .then((res) => { setRows(res.data); setPageMeta(res.meta); })
      .catch((e) => setError(parseError(e).message))
      .finally(() => setLoading(false));
  }, [page, debounced, role]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debounced, role]);

  return (
    <>
      <PageHeader icon={Users} title="Personnel Roster" subtitle="Everyone with access to the BASTION network (commanders only)." />

      <section className="toolbar panel">
        <div className="input-wrap grow">
          <Search size={18} className="input-icon" />
          <input className="input with-icon" placeholder="Search name, email, unit or service number…" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Search personnel" />
        </div>
        <FormSelect name="p-role" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="">All roles</option>
          <option value="admin">Base Commander</option>
          <option value="user">Supply Officer</option>
        </FormSelect>
        {(search || role) && <Button variant="ghost" size="sm" icon={X} onClick={() => { setSearch(''); setRole(''); }}>Clear</Button>}
      </section>

      {loading && rows.length === 0 ? <Loader label="Pulling roster…" />
        : error ? <ErrorState message={error} onRetry={load} />
        : rows.length === 0 ? <EmptyState title="No personnel found" />
        : (
          <div className={`panel corners table-wrap ${loading ? 'dim' : ''}`}>
            <table className="table">
              <thead><tr><th>Name</th><th>Service no.</th><th>Unit</th><th>Role</th><th>Requisitions</th><th>Enlisted</th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.rank} {u.name}</strong><small className="block muted">{u.email}</small></td>
                    <td className="mono">{u.service_number || '—'}</td>
                    <td>{u.unit || '—'}</td>
                    <td>
                      <span className={`role-chip ${u.role === 'admin' ? 'admin' : ''}`}>
                        {u.role === 'admin' ? <Star size={14} /> : <BadgeCheck size={14} />} {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="mono">{u.requisitions_count}</td>
                    <td className="mono">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Pagination meta={pageMeta} onPage={setPage} />
    </>
  );
}
