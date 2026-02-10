import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import ImageUpload from './ImageUpload';

const BlogForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    coverImage: null,
    imageUrl: '',
    useImageUrl: false
  });

  const [errors, setErrors] = useState({});
  const [key, setKey] = useState(0); 
  const [removeImage, setRemoveImage] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("🔄 Initializing edit form for blog:", initialData._id);
      console.log("Existing coverImage:", initialData.coverImage);
      
      // Check if existing image is a URL
      const hasExistingImage = initialData.coverImage && 
                              (initialData.coverImage.startsWith('http') || 
                               initialData.coverImage.startsWith('https'));
      
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        content: initialData.content || '',
        coverImage: null,
        imageUrl: initialData.coverImage || '', 
        useImageUrl: hasExistingImage 
      });
      
      setRemoveImage(false); // Reset removal state
      
      // Force ImageUpload component to reset
      setKey(prev => prev + 1);
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'imageUrl') {
      setFormData(prev => ({
        ...prev,
        imageUrl: value,
        useImageUrl: true,
        coverImage: null  
      }));
      setRemoveImage(false);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (file) => {
    console.log("File selected:", file?.name);
    setFormData(prev => ({
      ...prev,
      coverImage: file,
      useImageUrl: false,
      imageUrl: ''       
    }));
    setRemoveImage(false);
    
    if (errors.coverImage || errors.imageUrl) {
      setErrors(prev => ({ 
        ...prev, 
        coverImage: '', 
        imageUrl: '' 
      }));
    }
  };

  const toggleImageOption = (useUrl) => {
    console.log("Switching to:", useUrl ? "URL" : "Upload");
    setRemoveImage(false);
    setFormData(prev => ({
      ...prev,
      useImageUrl: useUrl,
      ...(useUrl ? { 
        coverImage: null,
      } : { 
        imageUrl: ''     
      })
    }));
    
    // Clear errors
    if (errors.coverImage || errors.imageUrl) {
      setErrors(prev => ({ 
        ...prev, 
        coverImage: '', 
        imageUrl: '' 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    // Skip image validation if removing image
    if (!removeImage) {
      // For new posts, require either image upload or URL
      if (!isEditing) {
        if (formData.useImageUrl) {
          if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'Image URL is required';
          } else if (!isValidUrl(formData.imageUrl)) {
            newErrors.imageUrl = 'Please enter a valid URL';
          }
        } else {
          if (!formData.coverImage) {
            newErrors.coverImage = 'Cover image is required';
          }
        }
      }
      // For editing, allow keeping existing image without new upload
      else {
        if (formData.useImageUrl && formData.imageUrl.trim() && !isValidUrl(formData.imageUrl)) {
          newErrors.imageUrl = 'Please enter a valid URL';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('content', formData.content);
      
      console.log("📤 Submitting form data:");
      console.log("- Title:", formData.title);
      console.log("- Subtitle:", formData.subtitle);
      console.log("- Content length:", formData.content.length);
      console.log("- useImageUrl:", formData.useImageUrl);
      console.log("- imageUrl:", formData.imageUrl);
      console.log("- coverImage:", formData.coverImage ? `File: ${formData.coverImage.name}` : 'null');
      console.log("- removeImage:", removeImage);
      
      // Handle image upload/update/removal

      if (removeImage) {

        formDataToSend.append('coverImage', '');
      
      } else if (formData.useImageUrl && formData.imageUrl.trim()) {

        // ✅ Send URL under 'imageUrl' — matches what backend destructures

        formDataToSend.append('coverImage', formData.imageUrl);  // was 'coverImage'
      
      } else if (formData.coverImage) {

        // File upload stays as 'coverImage' — multer reads req.file

        formDataToSend.append('coverImage', formData.coverImage);
      
      } else if (isEditing && initialData.coverImage && !formData.coverImage && !removeImage) {

        // Keeping existing image — send as 'imageUrl' if it's a URL

        if (initialData.coverImage.startsWith('http')) {

          formDataToSend.append('coverImage', initialData.coverImage); // ✅

        } else {

          formDataToSend.append('coverImage', initialData.coverImage);

        }

      }
 
      
      // Log FormData contents
      console.log("FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File - ${value.name}` : value);
      }
      
      await onSubmit(formDataToSend);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit form. Please try again.'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h2>
      
      {/* Debug info for editing */}
      {isEditing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Editing Mode:</strong> {initialData.title || 'Untitled'}
            {initialData.coverImage && (
              <span className="ml-2">• Existing image: {initialData.coverImage.substring(0, 50)}...</span>
            )}
          </p>
        </div>
      )}
      
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}
      
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter blog title"
        required
        error={errors.title}
        className="mb-4"
      />
      
      <Input
        label="Subtitle"
        name="subtitle"
        value={formData.subtitle}
        onChange={handleChange}
        placeholder="Enter blog subtitle (optional)"
        className="mb-4"
      />
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your blog content here..."
          rows="10"
          className={`
            w-full px-3 py-2 border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.content ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content}</p>
        )}
      </div>
      
      {/* Image Selection Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cover Image <span className="text-red-500">*</span>
          {!isEditing && <span className="text-xs text-gray-500 ml-1">(Required for new posts)</span>}
        </label>
        
        {/* Remove Image Option (Editing only) */}
        {isEditing && initialData.coverImage && !removeImage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Remove Current Image</h3>
                <p className="text-xs text-red-600 mt-1">
                  This will permanently remove the current cover image from the post
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRemoveImage(true);
                  setFormData(prev => ({
                    ...prev,
                    useImageUrl: false,
                    coverImage: null,
                    imageUrl: ''
                  }));
                }}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove Image
              </button>
            </div>
          </div>
        )}
        
        {removeImage ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Cover image will be removed
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  You can still upload a new image or use a URL below
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRemoveImage(false)}
              className="mt-3 px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200"
            >
              Cancel Removal
            </button>
          </div>
        ) : (
          <>
            {/* Toggle buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => toggleImageOption(false)}
                className={`
                  flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${!formData.useImageUrl 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  <span>Upload New Image</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => toggleImageOption(true)}
                className={`
                  flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${formData.useImageUrl 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  <span>Use Image URL</span>
                </div>
              </button>
            </div>
            
            {/* Upload Image Option */}
            {!formData.useImageUrl && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Image {isEditing && <span className="text-gray-500">(Replace existing)</span>}
                  </label>
                  <ImageUpload
                    key={key} // Force reset when editing new blog
                    onImageSelect={handleImageSelect}
                    existingImage={isEditing ? initialData.coverImage : ''}
                  />
                  {errors.coverImage && (
                    <p className="mt-2 text-sm text-red-500">{errors.coverImage}</p>
                  )}
                  {formData.coverImage && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          New image selected: {formData.coverImage.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {isEditing && initialData.coverImage && !formData.coverImage && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        <div>
                          <p className="text-sm text-blue-700">
                            Currently using existing image. Upload a new image to replace it.
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Or switch to "Use Image URL" to edit the URL.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Image URL Option */}
            {formData.useImageUrl && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={`
                      w-full px-4 py-3 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'}
                    `}
                  />
                  {errors.imageUrl && (
                    <p className="mt-2 text-sm text-red-500">{errors.imageUrl}</p>
                  )}
                  
                  {/* Show existing image preview when editing */}
                  {isEditing && initialData.coverImage && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                      <div className="max-w-xs">
                        <img
                          src={initialData.coverImage}
                          alt="Current"
                          className="w-full h-auto rounded-lg shadow-md border"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Show preview for new URLs */}
                  {formData.imageUrl && formData.imageUrl !== initialData.coverImage && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">New Image Preview:</p>
                      <div className="max-w-xs">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-auto rounded-lg shadow-md border border-blue-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                            e.target.className = 'w-full h-auto rounded-lg shadow-md border border-red-300';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Helper Text */}
        <p className="mt-4 text-sm text-gray-500">
          {removeImage ? (
            <>The cover image will be removed from this post.</>
          ) : isEditing ? (
            <>Select an option above to update or keep the current cover image.</>
          ) : (
            <>Select one option above to add a cover image to your blog post.</>
          )}
        </p>
      </div>
      
      <div className="flex justify-end space-x-4 mt-8">
        <Button type="submit" className="px-6 py-3">
          {isEditing ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
};

export default BlogForm; 

