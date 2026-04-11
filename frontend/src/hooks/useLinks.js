import { useState } from 'react';
import { createLink, createQrCode } from '../utils/linksApi.js';

export default function useLinks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (url) => {
    setIsLoading(true);
    try {
      return await createLink(url);
    } catch (error) {
      switch (error.response?.status) {
        case 400:
          setError('Empty url');
          break;
        case 422:
          setError('Invalid url');
          break;
        default:
          setError('Unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createQr = async (url) => {
    setIsLoading(true);
    try {
      return await createQrCode(url);
    } catch (error) {
      switch (error.response?.status) {
        default:
          setError('QR error occurred.');
      }
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    create,
    createQr,
    clearError: () => setError(null),
  };
}
