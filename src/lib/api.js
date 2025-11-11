import axios from 'axios';

const LARAVEL_API_BASE_URL = 'https://simpad.novarentech.web.id/api/';

const api = axios.create({
    baseURL: LARAVEL_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('authToken'); 
//         if (token) {
//         config.headers['Authorization'] = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

const HARDCODED_TOKEN = '2|afZiSKjiErheHUDM4Un7525hm8TDl7wpomWkDOfdd15b7159'; 

api.interceptors.request.use(
    (config) => {
        if (HARDCODED_TOKEN) {
        config.headers['Authorization'] = `Bearer ${HARDCODED_TOKEN}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;