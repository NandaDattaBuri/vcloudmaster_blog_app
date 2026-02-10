import axios from "axios";

const API = axios.create({
  baseURL: "https://blogbackend-yq0v.onrender.com/api/post",
});

// Add request interceptor to include token for protected routes
API.interceptors.request.use(
  (config) => {
    // Skip adding token for public routes
    const isPublicRoute = config.url === '/all' || 
                         (config.method === 'get' && config.url && !config.url.includes('/update') && !config.url.includes('/delete'));
    
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    // Add token only for protected routes
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, axios set the Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all blogs (public - no auth needed)
export const fetchAllBlogs = () => API.get("/all");

// Get single blog (public - no auth needed)
export const fetchBlogById = (id) => API.get(`/${id}`);

// Create new blog (protected - requires auth)
export const createBlog = (formData) => {
  return API.post("/", formData);
};

// Update blog (protected - requires auth)
export const updateBlog = (id, formData) => {
  return API.put(`/${id}`, formData);
};

// Delete blog (protected - requires auth)
export const deleteBlog = (id) => {
  return API.delete(`/${id}`);
};

// Simple login function
export const login = (email, password) => {
  return axios.post("https://blogbackend-yq0v.onrender.com/api/auth/login", {
    email,
    password
  });

};
