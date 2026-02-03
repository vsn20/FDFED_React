import axios from 'axios';

// Create an instance of axios
const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for CSRF cookies
});

// Variable to store CSRF token
let csrfToken = null;

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
    try {
        const response = await axios.get('http://localhost:5001/api/csrf-token', {
            withCredentials: true
        });
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
};

// Initialize CSRF token on app load
fetchCsrfToken();

/*
  NOTE: interceptors are a powerful feature of axios.
  They can be used to automatically add the auth token to every
  outgoing request, or to handle errors globally.
*/
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Use x-auth-token to match your existing backend
            config.headers['x-auth-token'] = token;
            // Also add Authorization header for the new company routes
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
            // Fetch CSRF token if not available
            if (!csrfToken) {
                await fetchCsrfToken();
            }
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
            }
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
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // If CSRF token is invalid, refresh it and retry
        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            csrfToken = null; // Clear old token
            await fetchCsrfToken(); // Get new token
            
            // Retry the original request with new token
            const originalRequest = error.config;
            if (csrfToken) {
                originalRequest.headers['x-csrf-token'] = csrfToken;
                return api(originalRequest);
            }
        }
        
        return Promise.reject(error);
    }
);

// Export function to manually refresh CSRF token if needed
export const refreshCsrfToken = fetchCsrfToken;

export default api;