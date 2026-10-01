import { Link } from 'react-router-dom';
import { LOGO_URL } from '../../config';

export const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 px-4 py-12">
    <div className="w-full max-w-md">
      <Link to="/" className="mb-8 flex justify-center">
        <img src={LOGO_URL} alt="VCloudMaster" className="h-12 w-auto object-contain" />
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
    </div>
  </div>
);

export const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  </label>
);
