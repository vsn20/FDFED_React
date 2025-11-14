import axios from 'axios';

// Create an instance of axios
const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
  NOTE: interceptors are a powerful feature of axios.
  They can be used to automatically add the auth token to every
  outgoing request, or to handle errors globally.
*/
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Use x-auth-token to match your existing backend
            config.headers['x-auth-token'] = token;
            // Also add Authorization header for the new company routes
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;