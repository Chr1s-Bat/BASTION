import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Radar, ShieldCheck, Star, UserRound, Users, X, Clock3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roleLabel } from '../utils/format';

const NAV = [
  { to: '/', label: 'Command Dashboard', icon: LayoutDashboard, end: true },
  { to: '/items', label: 'Equipment Depot', icon: Boxes },
  { to: '/requisitions', label: 'Requisitions', icon: ClipboardList },
  { to: '/profile', label: 'Service Record', icon: UserRound },
];

// Visible to Base Commanders only (the API route is also guarded by role:admin).
const ADMIN_NAV = { to: '/personnel', label: 'Personnel Roster', icon: Users };

function ZuluClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return (
    <span className="zulu"><Clock3 size={15} /> {hh}:{mm}:{ss}Z</span>
  );
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out. Token revoked.');
    navigate('/login');
  };

  return (
    <div className="shell">
      <div className="classification">UNCLASSIFIED // FOR TRAINING AND DEMONSTRATION USE ONLY</div>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-badge"><ShieldCheck size={26} /></span>
          <div>
            <p className="brand-name">BASTION</p>
            <p className="brand-sub">Logistics Command</p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="nav">
          {(isAdmin ? [...NAV.slice(0, 3), ADMIN_NAV, NAV[3]] : NAV).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card panel">
          <Radar size={20} />
          <p>{isAdmin ? 'Commander clearance: approve, issue and audit all requisitions.' : 'Officer clearance: register equipment and submit requisitions.'}</p>
        </div>

        <button className="nav-link logout" onClick={handleLogout}>
          <LogOut size={19} /> Sign out
        </button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <ZuluClock />
          <div className="topbar-user">
            <span className={`role-chip ${isAdmin ? 'admin' : ''}`}>
              {isAdmin ? <Star size={14} /> : <BadgeCheck size={14} />} {roleLabel(user.role)}
            </span>
            <div className="who">
              <strong>{user.rank} {user.name}</strong>
              <small>{user.unit || 'Unassigned'}</small>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">BASTION v1.0 · Base Logistics &amp; Requisition Command · Built with React + Laravel</footer>
      </div>
    </div>
  );
}
