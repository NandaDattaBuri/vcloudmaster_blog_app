<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { register } from '../api/authApi';
import { setUser } from '../utils/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setAlert({ type: '', message: '' });
      
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      
      // NEW: Use the new API format
      const result = await register(userData);
      
      console.log("Registration result:", result);
      
      // Check if registration was successful
      if (result.success) {
        // Store user data
        setUser(result.user);
        
        setAlert({
          type: 'success',
          message: 'Registration successful! Please login to continue.'
        });
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        
      } else {
        // Registration failed
        setAlert({
          type: 'error',
          message: result.error || 'Registration failed. Please try again.'
        });
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = 'User with this email already exists';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setAlert({
        type: 'error',
        message: errorMessage
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            Join our community and start sharing your stories.
          </p> */}
        </div>
        
        {alert.message && (
          <Alert 
            type={alert.type} 
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              error={errors.name}
            />
            
            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              error={errors.email}
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              required
              error={errors.password}
            />
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword}
            />
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="py-3 text-base font-medium"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

=======
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
>>>>>>> 3201524449986ef1a9997575ef524121454f4322
