import axios from 'axios';

// Always use the Render URL as the backend
const BACKEND_URL = 'https://lamuraai.onrender.com/api';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching auth token and fixing URLs
api.interceptors.request.use((config) => {
  // Always use Render URL if not provided by env
  const envUrl = import.meta.env.VITE_API_URL || 'https://lamuraai.onrender.com/api';
  
  if (envUrl) {
    let base = envUrl.replace(/\/+$/, ''); // remove trailing slash
    if (!base.endsWith('/api')) {
      base += '/api';
    }
    const path = config.url?.startsWith('/') ? config.url : `/${config.url}`;
    config.baseURL = ''; // Clear baseURL so Axios doesn't interfere
    config.url = `${base}${path}`;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`🚀 API Requesting: ${config.url || config.baseURL}`);
  return config;
});

// Interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
