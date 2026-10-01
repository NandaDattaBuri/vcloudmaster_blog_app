import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRegistrationStatus } from '../api/auth';
import { errorMessage } from '../api/client';
import { AuthShell, Field } from '../components/layout/AuthShell';
import { SITE_NAME } from '../config';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    fetchRegistrationStatus().then(({ open }) => setRegistrationOpen(open)).catch(() => {});
  }, []);

  if (isAuthenticated) return <Navigate to={location.state?.from || '/admin'} replace />;

  const update = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage the blog"
      footer={
        <>
          {registrationOpen && (
            <p className="mb-2">
              No account yet? <Link to="/register" className="font-semibold text-blue-700 hover:underline">Create one</Link>
            </p>
          )}
          <Link to="/" className="hover:text-slate-900">← Back to {SITE_NAME}</Link>
        </>
      }
    >
      <title>{`Sign in · ${SITE_NAME}`}</title>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} required autoFocus />
        <div>
          <Field
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={update}
            required
          />
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded border-slate-300" />
            Show password
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;