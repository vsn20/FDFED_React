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
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
