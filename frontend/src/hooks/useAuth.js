import { useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from '../utils/authApi';
import { setToken } from '../utils/authApi';
export default function useAuth() {
  const [token, setTokenState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      setTokenState(data.token);
      setToken(data.token);

      setIsAuthenticated(true);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
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
      console.log(error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTokenState(null);
    setIsAuthenticated(false);
    logoutUser();
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setTokenState(refreshToken());
        setIsAuthenticated(true);
      } catch {
        setTokenState(null);
        setIsAuthenticated(false);
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
    logout,
    clearError: () => setError(null),
  };
}
