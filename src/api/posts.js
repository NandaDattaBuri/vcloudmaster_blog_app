import client from './client';

const data = (request) => request.then((response) => response.data);

// Public
export const fetchPosts = (params) => data(client.get('/post/all', { params }));
export const fetchPostBySlug = (slug) => data(client.get(`/post/slug/${encodeURIComponent(slug)}`));
export const fetchPostById = (id) => data(client.get(`/post/${id}`));
export const likePost = (id) => data(client.post(`/post/${id}/like`));
export const dislikePost = (id) => data(client.post(`/post/${id}/dislike`));
export const addComment = (id, comment) => data(client.post(`/post/${id}/comments`, comment));

// Admin
export const fetchAdminPosts = () => data(client.get('/post/admin/all'));
export const createPost = (formData) => data(client.post('/post/create', formData));
export const updatePost = (id, formData) => data(client.put(`/post/${id}`, formData));
export const deletePost = (id) => data(client.delete(`/post/${id}`));
export const deleteComment = (postId, commentId) =>
  data(client.delete(`/post/${postId}/comments/${commentId}`));

// Uploads an image for use inside post content; resolves to its URL
export const uploadContentImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { url } = await data(client.post('/post/upload-image', formData));
  return url;
};
