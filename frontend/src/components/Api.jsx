import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add the Authorization header for all requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Global response interceptor for 401 errors (use window.location.href for redirect)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Token expired or invalid, redirecting to login");
            localStorage.removeItem('token');
            alert("Login Session Expired");
            window.location.href = '/login'; // Global redirection
        }
        return Promise.reject(error);
    }
);

export default API;
