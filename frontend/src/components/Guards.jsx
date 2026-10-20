import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Feedback';

/** Only signed-in users may enter. */
export function ProtectedRoute() {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <Loader label="Verifying credentials…" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

/** Only admins (Base Commanders) may enter. */
export function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/forbidden" replace />;
}

/** Login/Register are hidden once signed in. */
export function PublicOnlyRoute() {
  const { user, booting } = useAuth();
  if (booting) return <Loader label="Verifying credentials…" />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
