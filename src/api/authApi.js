import axios from "axios";

// Create axios instance for admin endpoints
const API = axios.create({
  baseURL: "https://blogbackend-yq0v.onrender.com/api/admin",
});

// Login User
export const login = async (email, password) => {
  try {
    console.log("Attempting login to:", `${API.defaults.baseURL}/login`);
    console.log("With credentials:", { email });
    
    const response = await API.post("/login", { 
      email, 
      password 
    });
    
    console.log("Login API Full Response:", response);
    console.log("Login API Data:", response.data);
    
    // Store the token in localStorage if received
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      
      // Store user data - based on the structure you showed
      let userData = {};
      
      if (response.data.user) {
        // Structure: { token, user: { name, email, _id } }
        userData = response.data.user;
      } else if (response.data.name && response.data.email && response.data._id) {
        // Structure: { token, name, email, _id }
        userData = {
          name: response.data.name,
          email: response.data.email,
          _id: response.data._id,
          ...response.data
        };
        // Remove token from userData if it's there
        delete userData.token;
      } else {
        // Fallback: create basic user object
        userData = {
          name: email.split('@')[0],
          email: email
        };
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User data saved to localStorage:", userData);
      console.log("Token saved:", response.data.token.substring(0, 20) + "...");
      
      // Verify storage
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      console.log("Verification - Stored token exists:", !!storedToken);
      console.log("Verification - Stored user exists:", !!storedUser);
      if (storedUser) {
        console.log("Verification - Parsed user:", JSON.parse(storedUser));
      }
    } else {
      console.error("No token received in response!");
      console.error("Full response data:", response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};

// Register User
export const register = async (formData) => {
  try {
    console.log("Attempting registration with:", formData);
    
    const response = await API.post("/register", formData);
    
    console.log("Registration API Response:", response.data);
    
    // If registration includes auto-login, store token
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      
      let userData = {};
      if (response.data.user) {
        userData = response.data.user;
      } else if (response.data.name && response.data.email) {
        userData = {
          name: response.data.name,
          email: response.data.email,
          _id: response.data._id,
          ...response.data
        };
        delete userData.token;
      } else {
        userData = {
          name: formData.name || formData.email.split('@')[0],
          email: formData.email
        };
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User registered and logged in:", userData);
    }
    
    return response.data;
  } catch (error) {
    console.error("Registration error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Logout (client-side only)
export const logout = () => {
  console.log("Logging out...");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("LocalStorage cleared");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const isAuth = token !== null && token !== undefined && token !== "";
  console.log("isAuthenticated check:", { hasToken: !!token, isAuth });
  return isAuth;
};

// Get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log("getCurrentUser returning:", parsedUser);
      return parsedUser;
    }
    console.log("getCurrentUser: No user found in localStorage");
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Get token
export const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("getToken returning:", token ? token.substring(0, 20) + "..." : "No token");
  return token;
};

// // Clear all auth data (for debugging)
// export const clearAuth = () => {
//   localStorage.clear();
//   console.log("All localStorage cleared");
// };