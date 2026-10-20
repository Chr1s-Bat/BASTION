import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Boxes, CalendarClock, Hash, Pencil, Send, Trash2, UserRound, Warehouse } from 'lucide-react';
import { dashboardService, itemService } from '../services/bastion';
import { parseError } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmDialog from '../components/ConfirmDialog';
import ItemFormModal from '../components/ItemFormModal';
import { ErrorState, Loader } from '../components/Feedback';
import { fmtDate } from '../utils/format';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    itemService.get(id).then(setItem).catch((e) => setError(parseError(e).message));
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => { dashboardService.meta().then(setMeta).catch(() => {}); }, []);

  const remove = async () => {
    setBusy(true);
    try {
      await itemService.remove(item.id);
      toast.success('Equipment record deleted.');
      navigate('/items');
    } catch (e) {
      toast.error(parseError(e).message);
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!item) return <Loader label="Retrieving file…" />;

  return (
    <>
      <PageHeader icon={Boxes} title={item.name} subtitle={`Serial ${item.serial_number}`}>
        <Link to="/items"><Button variant="ghost" icon={ArrowLeft}>Back to depot</Button></Link>
        {item.status === 'operational' && (
          <Button variant="success" icon={Send} onClick={() => navigate('/requisitions', { state: { openNew: true, itemId: item.id } })}>
            Request this item
          </Button>
        )}
        {item.can.update && meta && <Button variant="amber" icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
        {item.can.delete && <Button variant="danger" icon={Trash2} onClick={() => setDeleting(true)}>Delete</Button>}
      </PageHeader>

      <div className="detail-grid">
        <section className="panel corners detail-main">
          <div className="detail-icon"><CategoryIcon name={item.category?.icon} size={54} /></div>
          <div>
            <StatusBadge value={item.status} />
            <p className="detail-desc">{item.description || 'No description on file.'}</p>
            <dl className="facts">
              <div><dt><Hash size={15} /> Serial</dt><dd className="mono">{item.serial_number}</dd></div>
              <div><dt><Boxes size={15} /> Category</dt><dd>{item.category?.name}</dd></div>
              <div><dt><Warehouse size={15} /> Depot</dt><dd>{item.depot?.name}<small>{item.depot?.location}</small></dd></div>
              <div><dt><UserRound size={15} /> Registered by</dt><dd>{item.creator?.rank} {item.creator?.name}</dd></div>
              <div><dt><CalendarClock size={15} /> Registered</dt><dd className="mono">{fmtDate(item.created_at)}</dd></div>
            </dl>
          </div>
        </section>

        <aside className="panel corners gauge">
          <h3>Stock level</h3>
          <p className={`gauge-num ${item.low_stock ? 'text-red' : ''}`}>{item.quantity}</p>
          <p className="muted">units on hand</p>
          {item.low_stock && (
            <p className="alert-line"><AlertTriangle size={16} /> At or below reorder level ({item.reorder_level}).</p>
          )}
          <p className="muted small">Reorder level: <b className="mono">{item.reorder_level}</b></p>
        </aside>
      </div>

      {editing && meta && <ItemFormModal item={item} meta={meta} onClose={() => setEditing(false)} onSaved={(u) => { setEditing(false); setItem(u); }} />}
      {deleting && (
        <ConfirmDialog title="Delete equipment record" message={`Permanently remove "${item.name}" and its requisitions?`}
          confirmLabel="Delete item" loading={busy} onConfirm={remove} onCancel={() => setDeleting(false)} />
      )}
    </>
  );
}
