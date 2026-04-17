import { useState } from 'react';
import { createLink, createQrCode, getLinksList } from '../utils/linksApi.js';

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

  const createQr = async (url, format) => {
    setIsLoading(true);
    try {
      return await createQrCode(url, format);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Validation error occurred.');
          break;
        default:
          setError('QR error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLinks = async (offset, limit = 10) => {
    setIsLoading(true);
    try {
      return await getLinksList(offset, limit);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Validation error occurred.');
          break;
        default:
          setError('Links error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    create,
    createQr,
    getLinks,
    clearError: () => setError(null),
  };
}
