import axios from 'axios';
import { getToken, clearToken, clearStoredUser } from '../utils/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
      clearStoredUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
