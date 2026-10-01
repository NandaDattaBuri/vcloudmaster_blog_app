import { Link } from 'react-router-dom';
import { SITE_NAME } from '../config';

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <title>{`Page not found · ${SITE_NAME}`}</title>
    <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">404</p>
    <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Page not found</h1>
    <p className="mt-3 text-slate-600">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="mt-8 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
      Browse articles
    </Link>
  </div>
);

export default NotFound;
