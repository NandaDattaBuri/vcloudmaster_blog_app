
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRegistrationStatus } from '../api/auth';
import { errorMessage } from '../api/client';
import Spinner from '../components/ui/Spinner';
import { AuthShell, Field } from '../components/layout/AuthShell';
import { SITE_NAME } from '../config';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegistrationStatus()
      .then(({ open: isOpen }) => setOpen(isOpen))
      .catch(() => setOpen(true)); // let the server decide on submit
  }, []);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const update = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <p>
      Already have an account? <Link to="/login" className="font-semibold text-blue-700 hover:underline">Sign in</Link>
    </p>
  );

  if (open === null) {
    return <AuthShell title="Create admin account"><Spinner /></AuthShell>;
  }

  if (!open) {
    return (
      <AuthShell title="Registration closed" footer={footer}>
        <title>{`Register · ${SITE_NAME}`}</title>
        <p className="text-sm text-slate-600">
          New admin accounts can't be created right now. Ask an existing admin for access.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create admin account" subtitle="Set up access to write and manage posts" footer={footer}>
      <title>{`Register · ${SITE_NAME}`}</title>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <Field label="Full name" name="name" autoComplete="name" value={form.name} onChange={update} required autoFocus />
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={update} required minLength={8} />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update} required />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;