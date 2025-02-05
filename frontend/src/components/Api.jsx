import axios from 'axios';

// Create a popup div dynamically
const showPopup = (message, type = 'info') => {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.innerText = message;

    // Basic styles for transition (won't interfere with CSS file)
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.padding = '8px 17px';
    popup.style.backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
    popup.style.color = '#fff';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.5s ease-in-out';

    document.body.appendChild(popup);

    // Trigger fade-in
    setTimeout(() => popup.style.opacity = '1', 100);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => document.body.removeChild(popup), 500);
    }, 3000);
};

const API = axios.create({
    baseURL: 'https://managair-stocks-sales-managing-app.onrender.com/api/',
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

// Global response interceptor for 401 errors (session expiration)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            showPopup('Login Session Expired', 'error'); // Replacing alert with popup
            setTimeout(() => {
                window.location.href = '/login'; // Redirect after popup
            }, 1500);
        }
        return Promise.reject(error);
    }
);

export default API;
