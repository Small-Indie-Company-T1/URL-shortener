import { useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  setTokenUpdateHandler,
} from '../utils/authApi';
import { checkServerHealth } from '../utils/apiClient.js';

let authBootstrapPromise = null;

async function bootstrapAuth() {
  if (!authBootstrapPromise) {
    authBootstrapPromise = (async () => {
      await checkServerHealth();
      await refreshToken();
    })().finally(() => {
      authBootstrapPromise = null;
    });
  }

  return authBootstrapPromise;
}

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      await loginUser(email, password);
    } catch (error) {
      switch (error.response?.status) {
        case 401:
          setError('Неверная почта или пароль');
          break;
        default:
          setError('Неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, name, password) => {
    setError(null);
    setIsLoading(true);
    try {
      await registerUser(email, name, password);
      await login(email, password); // Автоматический вход после регистрации
    } catch (error) {
      switch (error.response?.status) {
        case 400:
          setError('Пользователь с такой почтой уже существует');
          break;
        default:
          setError('Неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setTokenUpdateHandler(setToken);

    const initAuth = async () => {
      try {
        await bootstrapAuth();
        if (alive) {
          setIsAuthenticated(true);
        }
      } catch {
        if (alive) {
          setIsAuthenticated(false);
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };
    initAuth();

    return () => (alive = false);
  }, []);

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logoutUser,
    clearError: () => setError(null),
  };
}
