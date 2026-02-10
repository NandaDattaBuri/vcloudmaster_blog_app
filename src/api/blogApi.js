import axios from "axios";
// Use only ONE axios instance
const API = axios.create({
  baseURL: "https://blogbackend-yq0v.onrender.com/api",  // Remove "/post"
});

// Update ALL endpoints:
export const fetchAllBlogs = () => API.get("/post/all");
export const fetchBlogById = (id) => API.get(`/post/${id}`);
export const createBlog = (formData) => API.post("/post", formData);
export const updateBlog = (id, formData) => API.put(`/post/${id}`, formData);
export const deleteBlog = (id) => API.delete(`/post/${id}`);
export const login = (email, password) => API.post("/auth/login", { email, password });

