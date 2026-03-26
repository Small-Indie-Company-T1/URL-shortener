import { useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  setTokenUpdateHandler,
} from '../utils/authApi';

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        case 409:
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
    setIsLoading(true);

    setTokenUpdateHandler(setToken);
    const initAuth = async () => {
      try {
        await refreshToken();
      } catch {
        await logoutUser();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
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
