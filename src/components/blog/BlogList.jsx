import React, { useState, useEffect } from 'react';
import { fetchAllBlogs } from '../../api/blogApi';
import Button from '../common/Button';

const BlogList = ({ onEdit, onDelete }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetchAllBlogs();
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to load blogs');
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await onDelete(id);
        loadBlogs(); // Refresh the list
      } catch (err) {
        console.error('Error deleting blog:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadBlogs}>Try Again</Button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button onClick={loadBlogs}>Refresh</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {blog.coverImage && (
              <div className="h-48 overflow-hidden">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                {blog.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {blog.subtitle || blog.content.substring(0, 150)}...
              </p>
              
              <div className="text-sm text-gray-500 mb-4">
                <p>Posted on: {new Date(blog.createdAt).toLocaleDateString()}</p>
                <p>Likes: {blog.likes || 0} | Dislikes: {blog.dislikes || 0}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => onEdit(blog)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(blog._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;