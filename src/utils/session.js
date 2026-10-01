// Auth session persisted in localStorage (same keys as earlier versions,
// so people who are already logged in stay logged in).
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getToken = () => read(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(read(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const saveSession = ({ token, ...user }) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable (private mode); session lasts for this page only
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('profile'); // left over from older versions
  } catch {
    // ignore
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? Date.now() >= payload.exp * 1000 : false;
  } catch {
    return true;
  }
};
