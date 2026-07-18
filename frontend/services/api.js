import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('taskflow-token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Placeholder refresh-token flow — expanded during the Auth implementation phase
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: attempt refresh-token exchange, then retry original request
    }
    return Promise.reject(error);
  }
);

export default api;
