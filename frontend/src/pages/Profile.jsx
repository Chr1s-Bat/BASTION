import { BadgeCheck, Fingerprint, Hash, Landmark, LogOut, Mail, ShieldCheck, Star, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { fmtDate, roleLabel } from '../utils/format';

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    toast.info('Signed out. Token revoked.');
    navigate('/login');
  };

  return (
    <>
      <PageHeader icon={Fingerprint} title="Service Record" subtitle="Your identity and clearance on the BASTION network." />
      <div className="id-card panel corners camo-soft">
        <div className="id-photo">{isAdmin ? <Star size={54} /> : <UserRound size={54} />}</div>
        <div className="id-body">
          <p className="id-rank">{user.rank}</p>
          <h2>{user.name}</h2>
          <span className={`role-chip ${isAdmin ? 'admin' : ''}`}>
            {isAdmin ? <Star size={14} /> : <BadgeCheck size={14} />} {roleLabel(user.role)}
          </span>
          <dl className="facts">
            <div><dt><Mail size={15} /> Email</dt><dd>{user.email}</dd></div>
            <div><dt><Hash size={15} /> Service no.</dt><dd className="mono">{user.service_number || '—'}</dd></div>
            <div><dt><Landmark size={15} /> Unit</dt><dd>{user.unit || 'Unassigned'}</dd></div>
            <div><dt><ShieldCheck size={15} /> Clearance</dt><dd>{isAdmin ? 'Approve, issue, audit and delete' : 'Register equipment and request supplies'}</dd></div>
            <div><dt><BadgeCheck size={15} /> Enlisted</dt><dd className="mono">{fmtDate(user.created_at)}</dd></div>
          </dl>
          <Button variant="danger" icon={LogOut} onClick={signOut}>Sign out and revoke token</Button>
        </div>
      </div>
    </>
  );
}
