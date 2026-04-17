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

export const checkServerHealth = async (retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await api.get('/healthcheck');
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
