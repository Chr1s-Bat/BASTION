import { Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './components/Guards';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Requisitions from './pages/Requisitions';
import Profile from './pages/Profile';
import Personnel from './pages/Personnel';
import { Forbidden, NotFound } from './pages/StatusPages';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes (any signed-in user) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="items" element={<Items />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="requisitions" element={<Requisitions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="forbidden" element={<Forbidden />} />

          {/* Admin-only routes: hidden in React here AND blocked by role:admin in Laravel */}
          <Route element={<AdminRoute />}>
            <Route path="personnel" element={<Personnel />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
