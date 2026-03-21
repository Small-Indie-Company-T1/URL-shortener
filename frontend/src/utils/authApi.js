import axios from 'axios';

const api = axios.create({
  baseURL: '/', // адрес бэка
  withCredentials: true,
});

let accessToken = null;

export const setToken = (token) => {
  accessToken = token;
};

export function setupInterceptors(logout) {
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
        logout();
        api.post('/logout');
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        error.config._retry = true;
        try {
          const refresh = await api.post('/refresh');

          const newToken = refresh.data.accessToken;
          setToken(newToken);

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api.request(originalRequest);
        } catch (err) {
          logout();
          api.post('/logout');
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
    return response.data;
  } catch (error) {
    console.error('Ошибка при входе:', error.message);
    throw error;
  }
}

export async function registerUser(email, name, password) {
  try {
    const response = await api.post('/register', { email, name, password });
    return response.data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error.message);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await api.post('/logout');
    setToken(null);
  } catch (error) {
    console.error('Ошибка при выходе:', error.message);
    throw error;
  }
}

export async function refreshToken() {
  try {
    const response = await api.post('/refresh');
    setToken(response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    setToken(null);
    throw error;
  }
}
