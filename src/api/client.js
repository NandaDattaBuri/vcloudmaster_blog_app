import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken, clearSession } from '../utils/session';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
});

// Send the token whenever we have one; public routes simply ignore it
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired/invalid token logs the admin out everywhere
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearSession();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  (error?.code === 'ECONNABORTED' ? 'The server took too long to respond' : null) ||
  (error?.request && !error?.response ? 'Cannot reach the server. Check your connection.' : null) ||
  fallback;

export default client;
