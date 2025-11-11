import axios from 'axios';

const LARAVEL_API_BASE_URL = 'https://simpad.novarentech.web.id/api/';

const api = axios.create({
    baseURL: LARAVEL_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); 
        if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;