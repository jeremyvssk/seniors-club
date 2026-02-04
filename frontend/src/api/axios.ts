// Axios instance with automatic JWT token injection and 401 error handling for all API requests
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // debug
      console.log('=== AXIOS REQUEST ===');
      console.log('URL:', `${config.baseURL || ''}${config.url || ''}`);
      console.log('Method:', config.method?.toUpperCase());
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('Data:', config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Debug: log successful responses
    console.log('=== AXIOS RESPONSE ===');
    console.log('URL:', response.config.url);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    // debug
    console.error('=== AXIOS RESPONSE ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;