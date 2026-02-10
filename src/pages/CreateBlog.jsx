import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/blog/BlogForm';
import { createBlog } from '../api/blogApi';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('profile'));
      if (!user || !user.token) {
        setError('Please log in to create a blog post');
        navigate('/login'); // Redirect to login
        return;
      }
      
      const response = await createBlog(formData);
      console.log('Blog created successfully:', response.data);
      
      // Navigate back to dashboard
      navigate('/dashboard', { 
        state: { message: 'Blog post created successfully!' }
      });
      
    } catch (err) {
      console.error('Error creating blog:', err);
      setError(err.response?.data?.message || 'Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <BlogForm 
          onSubmit={handleSubmit}
          isEditing={false}
        />
        
        {isSubmitting && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span>Creating blog post...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default CreateBlog;

