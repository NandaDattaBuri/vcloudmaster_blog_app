import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CreateBlog from '../pages/CreateBlog';
import BlogPost from '../pages/BlogPost';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { isAuthenticated } from '../utils/auth';

// Private Route Component
const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = () => {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/dashboard" />;
};

// Layout Component with Navbar
const Layout = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/dashboard" className="flex items-center">
                  <img 
                    src="https://www.vcloudmaster.com/assets/logo_3-CaoEdpo9.png" 
                    alt="BlogApp Logo"
                    className="h-15 w-auto object-contain"
                  />
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && user.name ? (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hello, {user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/create-blog" element={
            <Layout>
              <CreateBlog />
            </Layout>
          } />
          <Route path="/edit-blog/:id" element={
            <Layout>
              <CreateBlog isEditing={true} />
            </Layout>
          } />
          <Route path="/blog/:id" element={
            <Layout>
              <BlogPost />
            </Layout>
          } />
        </Route>
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <Link 
                to="/dashboard" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;