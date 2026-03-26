import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/auth', // адрес бэка
  withCredentials: true,
});

let accessToken = null;
let onTokenUpdate = null;
let refreshPromise = null;

const setToken = (token) => {
  accessToken = token;
};

export const setTokenUpdateHandler = (func) => {
  onTokenUpdate = func;
};

export function setupInterceptors() {
  api.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.url === '/refresh') {
        setToken(null);
        onTokenUpdate?.(null);
        await logoutUser();
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        error.config._retry = true;
        try {
          const newToken = await refreshToken();

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api.request(originalRequest);
        } catch (err) {
          await logoutUser();
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
}

export async function loginUser(email, password) {
  try {
    const response = await api.post('/login', { email, password });

    const newToken = response.data.access_token;
    setToken(newToken);
    onTokenUpdate?.(newToken);
  } catch (error) {
    console.error('Ошибка при входе:', error.status);
    throw error;
  }
}

export async function registerUser(email, nickname, password) {
  try {
    const response = await api.post('/register', { email, nickname, password });
    return response.data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error.status);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await api.post('/logout');
    setToken(null);
    onTokenUpdate?.(null);
  } catch (error) {
    console.error('Ошибка при выходе:', error.status);
    throw error;
  }
}

export async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/refresh')
      .then((response) => {
        const newToken = response.data.access_token;
        setToken(newToken);
        onTokenUpdate?.(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}
