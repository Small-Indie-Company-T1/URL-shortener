import { useCallback, useState } from 'react';
import {
  createLink,
  createQrCode,
  deleteLinkByShortCode,
  getLinkClicks,
  getLinksList,
} from '../utils/linksApi.js';

export default function useLinks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (url) => {
    setIsLoading(true);
    try {
      return await createLink(url);
    } catch (error) {
      switch (error.response?.status) {
        case 400:
          setError('Пустой URL');
          break;
        case 422:
          setError('Неверная ссылка');
          break;
        default:
          setError('Произошла неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createQr = useCallback(async (short_code, format) => {
    setIsLoading(true);
    try {
      return await createQrCode(short_code, format);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Ошибка валидации');
          break;
        default:
          setError('Ошибка создания QR-кода');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLinks = useCallback(async (params) => {
    setIsLoading(true);
    try {
      return await getLinksList(params);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Ошибка валидации');
          break;
        default:
          setError('Ошибка получения списка ссылок');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteLink = useCallback(async (short_code) => {
    setIsLoading(true);
    try {
      await deleteLinkByShortCode(short_code);
      return true;
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Ошибка валидации');
          break;
        default:
          setError('Произошла неизвестная ошибка');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClicks = useCallback(async (short_code) => {
    setIsLoading(true);
    try {
      return await getLinkClicks(short_code);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Ошибка валидации');
          break;
        default:
          setError('Произошла неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    create,
    createQr,
    getLinks,
    deleteLink,
    getClicks,
    clearError: useCallback(() => setError(null), [setError]),
  };
}
