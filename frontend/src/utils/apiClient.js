import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const createApi = (prefix) => {
  return {
    get: (url, config) => api.get(prefix + url, config),
    post: (url, data, config) => api.post(prefix + url, data, config),
  };
};
