import axios from 'axios';

const LARAVEL_API_BASE_URL = 'https://simpad.novarentech.web.id/api/';

const apiAuth = axios.create({
    baseURL: LARAVEL_API_BASE_URL,                      
});

export default apiAuth;