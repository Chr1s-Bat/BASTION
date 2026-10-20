import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Hash, KeyRound, Landmark, Mail, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../services/api';
import { isEmail, minLen, required, validate } from '../utils/validators';
import { FormInput, FormSelect } from '../components/FormInput';
import Button from '../components/Button';

const RANKS = ['Private', 'Corporal', 'Sergeant', 'Staff Sergeant', 'Second Lieutenant', 'First Lieutenant', 'Captain', 'Major'];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', rank: 'Private', service_number: '', unit: '', password: '', password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const clientErrors = validate({
      name: () => required(form.name, 'Full name') || minLen(form.name, 3, 'Full name'),
      email: () => required(form.email, 'Email') || isEmail(form.email),
      password: () => required(form.password, 'Passcode') || minLen(form.password, 8, 'Passcode'),
      password_confirmation: () => (form.password !== form.password_confirmation ? 'Passcodes do not match.' : ''),
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      const payload = { ...form };
      if (!payload.service_number) delete payload.service_number;
      if (!payload.unit) delete payload.unit;
      await register(payload);
      toast.success('Enlistment successful. Welcome aboard.');
      navigate('/', { replace: true });
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields); // 422 messages appear under each field
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page camo">
      <section className="auth-card panel corners wide">
        <div className="auth-logo"><ShieldCheck size={34} /> <span>BASTION</span></div>
        <h2><UserPlus size={22} /> Enlist New Account</h2>
        <p className="muted">New accounts are issued the Supply Officer role.</p>

        <form onSubmit={submit} noValidate className="form-grid">
          <FormInput label="Full name" name="name" icon={UserRound} value={form.name} onChange={onChange}
            error={errors.name} placeholder="Elena Navarro" required />
          <FormInput label="Email" name="email" type="email" icon={Mail} value={form.email} onChange={onChange}
            error={errors.email} placeholder="you@bastion.test" required />
          <FormSelect label="Rank" name="rank" icon={BadgeCheck} value={form.rank} onChange={onChange} error={errors.rank}>
            {RANKS.map((r) => <option key={r}>{r}</option>)}
          </FormSelect>
          <FormInput label="Service number" name="service_number" icon={Hash} value={form.service_number}
            onChange={onChange} error={errors.service_number} placeholder="BLC-0456" />
          <FormInput label="Unit" name="unit" icon={Landmark} value={form.unit} onChange={onChange}
            error={errors.unit} placeholder="Alpha Company" />
          <span />
          <FormInput label="Passcode" name="password" type="password" icon={KeyRound} value={form.password}
            onChange={onChange} error={errors.password} hint="Minimum 8 characters." required autoComplete="new-password" />
          <FormInput label="Confirm passcode" name="password_confirmation" type="password" icon={KeyRound}
            value={form.password_confirmation} onChange={onChange} error={errors.password_confirmation}
            required autoComplete="new-password" />
          <div className="span-2">
            <Button type="submit" variant="amber" icon={UserPlus} loading={busy} className="btn-block">Enlist &amp; sign in</Button>
          </div>
        </form>

        <p className="auth-switch">Already enlisted? <Link to="/login">Sign in</Link></p>
      </section>
    </div>
  );
}
