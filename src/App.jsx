import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin pages (and the editor) load on demand so readers download less
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PostEditor = lazy(() => import('./pages/admin/PostEditor'));
const Comments = lazy(() => import('./pages/admin/Comments'));

// Fresh editor state for each post (and for "new")
const PostEditorRoute = () => {
  const { id } = useParams();
  return <PostEditor key={id || 'new'} />;
};

// Keep links from the previous version of the app working
const Redirect = ({ to }) => {
  const params = useParams();
  return <Navigate to={to.replace(':id', params.id)} replace />;
};

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/post/:slug', element: <PostPage /> },
      { path: '/blog/:id', element: <Redirect to="/post/:id" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'new', element: <PostEditorRoute /> },
          { path: 'edit/:id', element: <PostEditorRoute /> },
          { path: 'comments', element: <Comments /> },
        ],
      },
      { path: '/dashboard', element: <Navigate to="/admin" replace /> },
      { path: '/create-blog', element: <Navigate to="/admin/new" replace /> },
      { path: '/edit-blog/:id', element: <Redirect to="/admin/edit/:id" /> },
    ],
  },
]);

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ToastProvider>
);

export default App;
