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

  const createQr = useCallback(async (short_code, format) => {
    setIsLoading(true);
    try {
      return await createQrCode(short_code, format);
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
  }, []);

  const getLinks = useCallback(async (offset, limit = 10) => {
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
  }, []);

  const deleteLink = useCallback(async (short_code) => {
    setIsLoading(true);
    try {
      await deleteLinkByShortCode(short_code);
      return true;
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Validation error occurred.');
          break;
        default:
          setError('Unknown error occurred.');
      }
      return false;
    }
  }, []);

  const getClicks = useCallback(async (link_id) => {
    setIsLoading(true);
    try {
      return await getLinkClicks(link_id);
    } catch (error) {
      switch (error.response?.status) {
        case 422:
          setError('Validation error occurred.');
          break;
        default:
          setError('Unknown error occurred.');
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
    clearError: () => setError(null),
  };
}
