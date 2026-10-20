import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Boxes, Eye, Filter, LayoutGrid, List, Pencil, Plus, Search, Send, Trash2, Warehouse, X,
} from 'lucide-react';
import { dashboardService, itemService } from '../services/bastion';
import { parseError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmDialog from '../components/ConfirmDialog';
import ItemFormModal from '../components/ItemFormModal';
import { FormSelect } from '../components/FormInput';
import { EmptyState, ErrorState, Loader } from '../components/Feedback';

export default function Items() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [depot, setDepot] = useState('');
  const [status, setStatus] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const [formItem, setFormItem] = useState(undefined); // undefined=closed, null=new, object=edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dashboardService.meta().then(setMeta).catch((e) => toast.error(parseError(e).message));
  }, [toast]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, per_page: 9 };
    if (debounced) params.search = debounced;
    if (category) params.category_id = category;
    if (depot) params.depot_id = depot;
    if (status) params.status = status;
    if (lowStock) params.low_stock = 1;
    itemService.list(params)
      .then((res) => { setRows(res.data); setPageMeta(res.meta); })
      .catch((e) => setError(parseError(e).message))
      .finally(() => setLoading(false));
  }, [page, debounced, category, depot, status, lowStock]);

  useEffect(load, [load]);

  // Any filter change returns to page 1.
  useEffect(() => setPage(1), [debounced, category, depot, status, lowStock]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setDepot(''); setStatus(''); setLowStock(false);
  };
  const hasFilters = search || category || depot || status || lowStock;

  const changeStatus = async (item, next) => {
    try {
      const updated = await itemService.setStatus(item.id, next);
      setRows((r) => r.map((x) => (x.id === item.id ? updated : x)));
      toast.success(`${item.name} marked ${next}.`);
    } catch (e) {
      toast.error(parseError(e).message);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await itemService.remove(toDelete.id);
      toast.success(`${toDelete.name} removed from inventory.`);
      setToDelete(null);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      toast.error(parseError(e).message);
    } finally {
      setDeleting(false);
    }
  };

  const saved = () => { setFormItem(undefined); load(); };

  const actions = (item) => (
    <div className="row-actions">
      <Link to={`/items/${item.id}`}><Button variant="ghost" size="sm" icon={Eye} iconOnly aria-label="View" title="View" /></Link>
      {item.status === 'operational' && (
        <Button variant="success" size="sm" icon={Send} iconOnly title="Request this item" aria-label="Request"
          onClick={() => navigate('/requisitions', { state: { openNew: true, itemId: item.id } })} />
      )}
      {item.can.update && <Button variant="ghost" size="sm" icon={Pencil} iconOnly title="Edit" aria-label="Edit" onClick={() => setFormItem(item)} />}
      {item.can.delete && <Button variant="danger" size="sm" icon={Trash2} iconOnly title="Delete" aria-label="Delete" onClick={() => setToDelete(item)} />}
    </div>
  );

  return (
    <>
      <PageHeader icon={Boxes} title="Equipment Depot" subtitle="Every item, serial number and stock level on base.">
        <Button variant="amber" icon={Plus} onClick={() => setFormItem(null)} disabled={!meta}>Register equipment</Button>
      </PageHeader>

      <section className="toolbar panel">
        <div className="input-wrap grow">
          <Search size={18} className="input-icon" />
          <input className="input with-icon" placeholder="Search by name or serial number…" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Search equipment" />
        </div>
        <FormSelect name="f-category" value={category} onChange={(e) => setCategory(e.target.value)} icon={Filter} aria-label="Category">
          <option value="">All categories</option>
          {meta?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormSelect>
        <FormSelect name="f-depot" value={depot} onChange={(e) => setDepot(e.target.value)} icon={Warehouse} aria-label="Depot">
          <option value="">All depots</option>
          {meta?.depots.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </FormSelect>
        <FormSelect name="f-status" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          {meta?.item_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </FormSelect>
        <label className={`chip-toggle ${lowStock ? 'on' : ''}`}>
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
          <AlertTriangle size={15} /> Low stock
        </label>
        {hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear</Button>}
        <div className="view-toggle">
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={18} /></button>
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view"><List size={18} /></button>
        </div>
      </section>

      {loading && rows.length === 0 ? (
        <Loader label="Scanning depots…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState title="No equipment matches" text={hasFilters ? 'Adjust or clear your filters.' : 'Register the first item.'}
          action={hasFilters && <Button variant="ghost" icon={X} onClick={clearFilters}>Clear filters</Button>} />
      ) : view === 'grid' ? (
        <div className={`card-grid ${loading ? 'dim' : ''}`}>
          {rows.map((item) => {
            const pct = Math.min(100, Math.round((item.quantity / Math.max(item.reorder_level * 4, 1)) * 100));
            return (
              <article key={item.id} className="item-card panel corners">
                <div className="item-top">
                  <span className="cat-badge"><CategoryIcon name={item.category?.icon} /></span>
                  <StatusBadge value={item.status} />
                </div>
                <h3 className="item-name">{item.name}</h3>
                <p className="mono serial">{item.serial_number}</p>
                <p className="item-meta"><Warehouse size={14} /> {item.depot?.name}</p>
                <div className="stock">
                  <div className="stock-row">
                    <span>Stock</span>
                    <b className={item.low_stock ? 'text-red' : ''}>
                      {item.low_stock && <AlertTriangle size={13} />} {item.quantity}
                    </b>
                  </div>
                  <div className="bar"><i className={item.low_stock ? 'low' : ''} style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="item-foot">
                  {isAdmin ? (
                    <select className="input mini" value={item.status} aria-label="Change status"
                      onChange={(e) => changeStatus(item, e.target.value)}>
                      {meta?.item_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <span className="muted small">{item.category?.name}</span>}
                  {actions(item)}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={`panel corners table-wrap ${loading ? 'dim' : ''}`}>
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Serial</th><th>Category</th><th>Depot</th><th>Stock</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td className="mono">{item.serial_number}</td>
                  <td>{item.category?.name}</td>
                  <td>{item.depot?.name}</td>
                  <td className={`mono ${item.low_stock ? 'text-red' : ''}`}>{item.quantity}</td>
                  <td>
                    {isAdmin ? (
                      <select className="input mini" value={item.status} onChange={(e) => changeStatus(item, e.target.value)} aria-label="Change status">
                        {meta?.item_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : <StatusBadge value={item.status} />}
                  </td>
                  <td>{actions(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={pageMeta} onPage={setPage} />

      {formItem !== undefined && meta && (
        <ItemFormModal item={formItem || undefined} meta={meta} onClose={() => setFormItem(undefined)} onSaved={saved} />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete equipment record"
          message={`Permanently remove "${toDelete.name}" (${toDelete.serial_number}) and all of its requisitions? This cannot be undone.`}
          confirmLabel="Delete item"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
