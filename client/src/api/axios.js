import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = envUrl.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? envUrl.replace('localhost', window.location.hostname)
  : envUrl;

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { API_URL };

// ======================================
// ADD JWT TOKEN TO EVERY REQUEST
// ======================================
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================
// HANDLE EXPIRED / INVALID SESSIONS
// ======================================
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
    return Promise.reject(error);
  }
);

export default instance;