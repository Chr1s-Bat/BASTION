import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Ban, CheckCircle2, ClipboardList, Filter, PackageCheck, Pencil, Plus, Search, Trash2, Undo2, X,
} from 'lucide-react';
import { dashboardService, requisitionService } from '../services/bastion';
import { parseError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import RequisitionFormModal from '../components/RequisitionFormModal';
import { FormSelect } from '../components/FormInput';
import { EmptyState, ErrorState, Loader } from '../components/Feedback';
import { fmtDate } from '../utils/format';

// Workflow actions the commander can take, keyed by the next status.
const ACTIONS = {
  approved: { label: 'Approve', icon: CheckCircle2, variant: 'success', text: 'Approve this requisition?', askRemarks: false },
  issued: { label: 'Issue', icon: PackageCheck, variant: 'amber', text: 'Issue the equipment? Stock will be deducted.', askRemarks: false },
  returned: { label: 'Mark returned', icon: Undo2, variant: 'ghost', text: 'Confirm the equipment was returned? Stock will be restored.', askRemarks: false },
  rejected: { label: 'Reject', icon: Ban, variant: 'danger', text: 'Reject this requisition?', askRemarks: true },
};

export default function Requisitions() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const [formState, setFormState] = useState(undefined); // undefined closed | {requisition?, itemId?}
  const [toDelete, setToDelete] = useState(null);
  const [action, setAction] = useState(null); // { row, next }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dashboardService.meta().then(setMeta).catch((e) => toast.error(parseError(e).message));
  }, [toast]);

  // Arriving from "Request this item" / "New requisition" buttons opens the form.
  useEffect(() => {
    if (location.state?.openNew && meta) {
      setFormState({ itemId: location.state.itemId });
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, meta, navigate]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, per_page: 8 };
    if (debounced) params.search = debounced;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    requisitionService.list(params)
      .then((res) => { setRows(res.data); setPageMeta(res.meta); })
      .catch((e) => setError(parseError(e).message))
      .finally(() => setLoading(false));
  }, [page, debounced, status, priority]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debounced, status, priority]);

  const hasFilters = search || status || priority;
  const clear = () => { setSearch(''); setStatus(''); setPriority(''); };

  const runAction = async (remarks) => {
    setBusy(true);
    try {
      await requisitionService.setStatus(action.row.id, action.next, remarks);
      toast.success(`${action.row.reference} is now ${action.next}.`);
      setAction(null);
      load();
    } catch (e) {
      const { message, fields } = parseError(e);
      toast.error(fields.status || message);
      setAction(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await requisitionService.remove(toDelete.id);
      toast.success(`${toDelete.reference} deleted.`);
      setToDelete(null);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      toast.error(parseError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader icon={ClipboardList} title="Requisitions"
        subtitle={isAdmin ? 'All requests on base. Approve, issue and close them out.' : 'Your equipment requests and their progress.'}>
        <Button variant="amber" icon={Plus} onClick={() => setFormState({})} disabled={!meta}>New requisition</Button>
      </PageHeader>

      <section className="toolbar panel">
        <div className="input-wrap grow">
          <Search size={18} className="input-icon" />
          <input className="input with-icon" placeholder="Search reference, purpose or equipment…" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Search requisitions" />
        </div>
        <FormSelect name="r-status" icon={Filter} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          {meta?.requisition_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </FormSelect>
        <FormSelect name="r-priority" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="">Any priority</option>
          {meta?.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </FormSelect>
        {hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clear}>Clear</Button>}
      </section>

      {loading && rows.length === 0 ? (
        <Loader label="Retrieving requisitions…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState title="No requisitions found" text={hasFilters ? 'Try different filters.' : 'File your first requisition.'} />
      ) : (
        <div className={`panel corners table-wrap ${loading ? 'dim' : ''}`}>
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th><th>Equipment</th>{isAdmin && <th>Officer</th>}<th>Qty</th>
                <th>Priority</th><th>Status</th><th>Needed by</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.reference}</td>
                  <td>
                    <strong>{r.item?.name}</strong>
                    <small className="block muted">{r.purpose}</small>
                    {r.remarks && <small className="block remark">“{r.remarks}”</small>}
                  </td>
                  {isAdmin && <td>{r.user?.rank} {r.user?.name}</td>}
                  <td className="mono">{r.quantity}</td>
                  <td><StatusBadge value={r.priority} /></td>
                  <td><StatusBadge value={r.status} /></td>
                  <td className="mono">{r.needed_by ? fmtDate(r.needed_by) : '—'}</td>
                  <td>
                    <div className="row-actions wrap">
                      {isAdmin && r.next_statuses.map((next) => {
                        const a = ACTIONS[next];
                        return (
                          <Button key={next} variant={a.variant} size="sm" icon={a.icon} onClick={() => setAction({ row: r, next })}>
                            {a.label}
                          </Button>
                        );
                      })}
                      {r.can.update && <Button variant="ghost" size="sm" icon={Pencil} iconOnly title="Edit" aria-label="Edit" onClick={() => setFormState({ requisition: r })} />}
                      {r.can.delete && <Button variant="danger" size="sm" icon={Trash2} iconOnly title="Delete" aria-label="Delete" onClick={() => setToDelete(r)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={pageMeta} onPage={setPage} />

      {formState !== undefined && meta && (
        <RequisitionFormModal requisition={formState.requisition} presetItemId={formState.itemId} meta={meta}
          onClose={() => setFormState(undefined)} onSaved={() => { setFormState(undefined); load(); }} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete requisition" message={`Delete ${toDelete.reference}? This cannot be undone.`}
          confirmLabel="Delete" loading={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
      {action && (
        <ConfirmDialog
          title={`${ACTIONS[action.next].label} ${action.row.reference}`}
          message={ACTIONS[action.next].text}
          confirmLabel={ACTIONS[action.next].label}
          variant={action.next === 'rejected' ? 'danger' : 'amber'}
          askRemarks={ACTIONS[action.next].askRemarks}
          loading={busy}
          onConfirm={runAction}
          onCancel={() => setAction(null)}
        />
      )}
    </>
  );
}
