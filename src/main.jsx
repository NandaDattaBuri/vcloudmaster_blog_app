import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const checkAuth = () => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    try {
      const user = JSON.parse(profile);
      if (!user.token) {
        localStorage.clear();
      }
    } catch (error) {
      localStorage.clear();
    }
  }
};

checkAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);