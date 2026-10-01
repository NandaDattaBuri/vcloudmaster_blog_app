import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { LOGO_URL, MAIN_SITE_URL, SITE_NAME } from '../../config';

const SearchBox = ({ onDone }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
        onDone?.();
      }}
      className="relative w-full"
    >
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </form>
  );
};

const navClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'}`;

const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${SITE_NAME} home`}>
            <img src={LOGO_URL} alt="VCloudMaster" className="h-9 w-auto object-contain" />
            <span className="hidden border-l border-slate-200 pl-2 text-sm font-semibold text-slate-500 sm:inline">Blog</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={navClass}>Articles</NavLink>
            <a href={MAIN_SITE_URL} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              VCloudMaster
            </a>
          </nav>

          <div className="ml-auto hidden w-72 md:block">
            <SearchBox key={location.search} />
          </div>

          {isAuthenticated && (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Dashboard
              </Link>
              <Link to="/admin/new" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                <Icon name="edit" className="h-4 w-4" /> Write
              </Link>
            </div>
          )}

          <button
            className="ml-auto rounded-md p-2 text-slate-600 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-4 border-t border-slate-200 px-4 py-4 md:hidden">
            <SearchBox onDone={() => setMenuOpen(false)} />
            <nav className="flex flex-col gap-3" onClick={() => setMenuOpen(false)}>
              <NavLink to="/" end className={navClass}>Articles</NavLink>
              <a href={MAIN_SITE_URL} className="text-sm font-medium text-slate-600">VCloudMaster</a>
              {isAuthenticated && (
                <>
                  <NavLink to="/admin" className={navClass}>Dashboard</NavLink>
                  <NavLink to="/admin/new" className={navClass}>Write a post</NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <img src={LOGO_URL} alt="VCloudMaster" className="h-8 w-auto object-contain" />
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Practical guides on cloud, DevOps and modern engineering.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900">Articles</Link>
            <a href={MAIN_SITE_URL} className="hover:text-slate-900">Main site</a>
            <Link to={isAuthenticated ? '/admin' : '/login'} className="hover:text-slate-900">
              {isAuthenticated ? 'Dashboard' : 'Admin'}
            </Link>
            <span>© {new Date().getFullYear()} VCloudMaster</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
