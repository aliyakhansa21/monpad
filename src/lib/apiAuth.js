import axios from 'axios';

const LARAVEL_API_BASE_URL = 'http://127.0.0.1:8000/api/';

const apiAuth = axios.create({
    baseURL: LARAVEL_API_BASE_URL,                      
});

export default apiAuth;