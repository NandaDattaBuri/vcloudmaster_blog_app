
// Store user data in localStorage
export const setUser = (userData) => {
  localStorage.setItem("profile", JSON.stringify(userData));
  localStorage.setItem("token", userData.token);
};

// Get user from localStorage
export const getUser = () => {
  const profile = localStorage.getItem("profile");
  return profile ? JSON.parse(profile) : null;
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return token !== null && token !== undefined;
};

// Clear user data (logout)
export const clearUser = () => {
  localStorage.removeItem("profile");
  localStorage.removeItem("token");
};

// Check token expiration
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
};