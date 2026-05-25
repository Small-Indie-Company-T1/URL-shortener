import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
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
  }, []);

  const register = useCallback(
    async (email, name, password) => {
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
    },
    [login]
  );

  useEffect(() => {
    let alive = true;
    setTokenUpdateHandler(setToken);

    const initAuth = async () => {
      try {
        await bootstrapAuth();
      } finally {
        if (alive) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };
    void initAuth();

    return () => {
      alive = false;
    };
  }, []);

  return {
    token,
    isAuthenticated: !!token,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logoutUser,
    clearError: () => setError(null),
  };
}
