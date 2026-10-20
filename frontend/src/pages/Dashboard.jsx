import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Boxes, CalendarClock, ClipboardList, Hourglass, LayoutDashboard, PackageCheck, Plus, RefreshCw,
  Search, Wrench, Layers, ShieldCheck,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { dashboardService } from '../services/bastion';
import { parseError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { ErrorState, Loader } from '../components/Feedback';
import { fmtDate } from '../utils/format';

const STATUS_COLORS = { pending: '#f2a900', approved: '#6fa34a', issued: '#4f8fc0', returned: '#8a8f80', rejected: '#c0392b' };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    dashboardService.get().then(setData).catch((e) => setError(parseError(e).message)).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading && !data) return <Loader label="Compiling situation report…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const f = data.figures;
  const scope = data.scope === 'base' ? 'Base-wide' : 'Your';

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title="Command Dashboard"
        subtitle={`Situation report for ${user.rank} ${user.name} · ${scope.toLowerCase()} requisition figures`}
      >
        <Button variant="ghost" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
        <Link to="/requisitions" state={{ openNew: true }}><Button variant="amber" icon={Plus}>New requisition</Button></Link>
      </PageHeader>

      <div className="banner panel">
        <ShieldCheck size={30} />
        <div>
          <strong>{isAdmin ? 'Commander view active.' : 'Officer view active.'}</strong>
          <p>
            {f.pending_requisitions > 0
              ? `${f.pending_requisitions} requisition${f.pending_requisitions === 1 ? '' : 's'} awaiting action.`
              : 'No requisitions awaiting action. All clear.'}{' '}
            {f.low_stock_items > 0 && `${f.low_stock_items} item line${f.low_stock_items === 1 ? ' is' : 's are'} at or below reorder level.`}
          </p>
        </div>
      </div>

      <section className="stat-grid">
        <StatCard icon={Boxes} label="Equipment lines" value={f.total_items} tone="olive" sub={`${f.operational_items} operational`} />
        <StatCard icon={Layers} label="Units in stock" value={f.total_units.toLocaleString()} tone="khaki" sub="across all depots" />
        <StatCard icon={AlertTriangle} label="Low stock" value={f.low_stock_items} tone="red" sub="at / below reorder level" />
        <StatCard icon={Wrench} label="In maintenance" value={f.maintenance_items} tone="amber" sub="unavailable to issue" />
        <StatCard icon={ClipboardList} label={`${scope} requisitions`} value={f.total_requisitions} tone="blue" sub="all time" />
        <StatCard icon={Hourglass} label="Pending" value={f.pending_requisitions} tone="amber" sub="awaiting decision" />
        <StatCard icon={PackageCheck} label="Currently issued" value={f.issued_requisitions} tone="green" sub="out in the field" />
        <StatCard icon={CalendarClock} label="This week" value={f.requisitions_this_week} tone="olive" sub="new requisitions" />
      </section>

      <section className="chart-grid">
        <div className="panel corners chart-card">
          <h3>Equipment lines by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.items_by_category} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3626" />
              <XAxis dataKey="code" stroke="#9aa58a" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9aa58a" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#141a12', border: '1px solid #4b5d2a', color: '#e4e7d8' }}
                labelFormatter={(code) => data.items_by_category.find((c) => c.code === code)?.name} />
              <Bar dataKey="total" name="Items" fill="#8aa63e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel corners chart-card">
          <h3>Requisitions by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.requisitions_by_status.filter((s) => s.total > 0)} dataKey="total" nameKey="status"
                innerRadius={55} outerRadius={95} paddingAngle={3} stroke="#0b0f0a">
                {data.requisitions_by_status.filter((s) => s.total > 0).map((s) => (
                  <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#141a12', border: '1px solid #4b5d2a', color: '#e4e7d8' }} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="legend">
            {data.requisitions_by_status.map((s) => (
              <li key={s.status}><i style={{ background: STATUS_COLORS[s.status] }} /> {s.status} <b>{s.total}</b></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel corners">
        <div className="section-head">
          <h3><ClipboardList size={19} /> Recent requisitions</h3>
          <Link to="/requisitions" className="link"><Search size={14} /> View all</Link>
        </div>
        {data.recent_requisitions.length === 0 ? (
          <p className="muted pad">No requisitions yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>Equipment</th><th>Officer</th><th>Qty</th><th>Priority</th><th>Status</th><th>Filed</th></tr>
              </thead>
              <tbody>
                {data.recent_requisitions.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.reference}</td>
                    <td>{r.item?.name}</td>
                    <td>{r.user?.rank} {r.user?.name}</td>
                    <td className="mono">{r.quantity}</td>
                    <td><StatusBadge value={r.priority} /></td>
                    <td><StatusBadge value={r.status} /></td>
                    <td className="mono">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
