import { Suspense } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { PageSpinner } from '../ui/Spinner';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { LOGO_URL } from '../../config';

const links = [
  { to: '/admin', label: 'Posts', icon: 'grid', end: true },
  { to: '/admin/new', label: 'New post', icon: 'plus' },
  { to: '/admin/comments', label: 'Comments', icon: 'comment' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="flex shrink-0 items-center gap-2">
            <img src={LOGO_URL} alt="VCloudMaster" className="h-8 w-auto object-contain" />
            <span className="hidden rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white sm:inline">Admin</span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon name={icon} className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 md:inline-flex"
            >
              View blog <Icon name="external" className="h-3.5 w-3.5" />
            </Link>
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Log out"
              aria-label="Log out"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
