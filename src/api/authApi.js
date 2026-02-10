import axios from "axios";

// Create axios instance for admin endpoints
const API = axios.create({
  baseURL: "https://blogbackend-yq0v.onrender.com/api/admin",
});

// Add request interceptor to include token for all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login User
export const login = async (email, password) => {
  try {
    console.log("Attempting login with email:", email);
    
    const response = await API.post("/login", { email, password });
    
    console.log("Login response received:", response.data);
    
    // Extract token and user from response
    const token = response.data.token;
    let user = null;
    
    if (response.data.user) {
      // Format: { token, user: { ... } }
      user = response.data.user;
    } else if (response.data._id) {
      // Format: { token, _id, name, email, ... }
      user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email
      };
    } else {
      // Create basic user object
      user = {
        name: email.split('@')[0],
        email: email
      };
    }
    
    // Store in localStorage
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("✅ Login successful - Token and user stored");
    } else {
      console.error("❌ No token in response");
    }
    
    // Return consistent format
    return {
      success: true,
      user,
      token
    };
    
  } catch (error) {
    console.error("Login failed:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    return {
      success: false,
      error: error.response?.data?.message || "Login failed"
    };
  }
};

// Register User
export const register = async (formData) => {
  try {
    console.log("Attempting registration with:", formData);
    
    const response = await API.post("/register", formData);
    
    console.log("Registration response:", response.data);
    
    // Extract token and user from response
    const token = response.data.token;
    let user = null;
    
    if (response.data.user) {
      // Format: { token, user: { ... } }
      user = response.data.user;
    } else if (response.data._id) {
      // Format: { token, _id, name, email, ... }
      user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email
      };
    } else {
      // Create user from form data
      user = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email
      };
    }
    
    // Store in localStorage
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("✅ Registration successful - Token and user stored");
    }
    
    // Return consistent format
    return {
      success: true,
      user,
      token
    };
    
  } catch (error) {
    console.error("Registration failed:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed"
    };
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("✅ Logged out");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const hasToken = token && token.trim() !== "";
  
  // Optional: Also check if token is valid (not expired)
  if (hasToken) {
    // You could add JWT expiration check here
    return true;
  }
  
  return false;
};

// Get current user
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Verify auth status
export const verifyAuth = () => {
  const token = getToken();
  const user = getCurrentUser();
  
  console.log("Auth verification:", {
    hasToken: !!token,
    hasUser: !!user,
    user: user
  });
  
  return {
    isAuthenticated: isAuthenticated(),
    user,
    token
  };
};

// Clear all auth data (for debugging)
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("Auth data cleared");
};

// Test authentication
export const testAuth = async () => {
  console.log("=== AUTH TEST ===");
  console.log("1. Current token:", getToken()?.substring(0, 20) + "...");
  console.log("2. Current user:", getCurrentUser());
  console.log("3. Is authenticated:", isAuthenticated());
  console.log("=== END TEST ===");
};

// Auto-clear expired tokens (optional)
const cleanupExpiredAuth = () => {
  // You can implement JWT expiration check here
  const token = getToken();
  if (token) {
    // Check if token is expired
    // If expired, clear auth data
    // logout();
  }
};

// Run cleanup on import
cleanupExpiredAuth();
