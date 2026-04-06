import { useState } from 'react';
import { createLink } from '../utils/linksApi.js';

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

  return {
    isLoading,
    error,
    create,
    clearError: () => setError(null),
  };
}
