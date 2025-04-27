// services/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with an error status
      if (error.response.status === 401) {
        // Unauthorized - clear user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ message: 'Server not responding. Please try again later.' });
    } else {
      // Something happened in setting up the request
      return Promise.reject(error);
    }
  }
);

export default api;