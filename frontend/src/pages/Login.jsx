import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, ClipboardCheck, KeyRound, LogIn, Mail, Radar, ShieldCheck, Star, UserRound, Warehouse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../services/api';
import { isEmail, required, validate } from '../utils/validators';
import { FormInput } from '../components/FormInput';
import Button from '../components/Button';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const clientErrors = validate({
      email: () => required(form.email, 'Email') || isEmail(form.email),
      password: () => required(form.password, 'Passcode'),
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.rank} ${user.name}.`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields);
      if (!Object.keys(fields).length) toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'Password123!' });
    setErrors({});
  };

  return (
    <div className="auth-page camo">
      <section className="auth-hero">
        <div className="hero-badge"><ShieldCheck size={54} /></div>
        <h1 className="hero-title">BASTION</h1>
        <p className="hero-sub">BASE LOGISTICS &amp; REQUISITION COMMAND</p>
        <p className="hero-text">
          One secure system for every depot, every item and every requisition on base —
          from request to issue to return.
        </p>
        <ul className="hero-list">
          <li><Warehouse size={20} /> Live depot inventory with low-stock alerts</li>
          <li><ClipboardCheck size={20} /> Requisition workflow: pending → approved → issued → returned</li>
          <li><Boxes size={20} /> Search, filter and track every serial number</li>
          <li><Radar size={20} /> Commander dashboard with real-time figures</li>
        </ul>
      </section>

      <section className="auth-card panel corners">
        <h2><LogIn size={22} /> Secure Sign-in</h2>
        <p className="muted">Authenticate to access the command network.</p>

        <form onSubmit={submit} noValidate>
          <FormInput label="Email" name="email" type="email" icon={Mail} value={form.email} onChange={onChange}
            error={errors.email} placeholder="officer@bastion.test" autoComplete="email" required />
          <FormInput label="Passcode" name="password" type="password" icon={KeyRound} value={form.password}
            onChange={onChange} error={errors.password} placeholder="••••••••" autoComplete="current-password" required />
          <Button type="submit" variant="amber" icon={LogIn} loading={busy} className="btn-block">Authenticate</Button>
        </form>

        <div className="demo-box">
          <p className="demo-title">Demo accounts · password <code>Password123!</code></p>
          <div className="demo-btns">
            <Button variant="ghost" size="sm" icon={Star} onClick={() => fillDemo('admin@bastion.test')}>Commander</Button>
            <Button variant="ghost" size="sm" icon={UserRound} onClick={() => fillDemo('officer@bastion.test')}>Officer</Button>
          </div>
        </div>

        <p className="auth-switch">New recruit? <Link to="/register">Enlist an account</Link></p>
      </section>
    </div>
  );
}
