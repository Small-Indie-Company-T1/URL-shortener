import { createApi, api } from './apiClient.js';

const linksApi = createApi('/links');

export async function createLink(original_url) {
  try {
    const response = await linksApi.post('/create', { original_url });
    return response.data;
  } catch (error) {
    console.error('Ошибка генерации ссылки: ', error.status);
    throw error;
  }
}

export async function createQrCode(url_id, format) {
  try {
    const response = await linksApi.get(`/${url_id}/qr?fmt=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка генерации QR-кода: ', error.data.detail.msg);
    throw error;
  }
}

export async function getLinksList({
  offset = 0,
  limit = 10,
  original_url,
  is_active,
  order_by,
  order_dir,
}) {
  try {
    let queryParams = new URLSearchParams({ offset, limit });
    if (original_url) {
      queryParams.set('original_url', original_url);
    }
    if (is_active !== null && is_active !== undefined) {
      queryParams.set('is_active', is_active);
    }
    if (['created_at', 'clicks'].includes(order_by)) {
      queryParams.set('order_by', order_by);
    }
    if (['asc', 'desc'].includes(order_dir)) {
      queryParams.set('order_dir', order_dir);
    }
    const response = await linksApi.get(`/?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error(error.data.detail.msg);
    throw error;
  }
}

export async function deleteLinkByShortCode(short_code) {
  try {
    const response = await linksApi.delete(`/${short_code}`);
    return response.data;
  } catch (error) {
    console.error(error.data.detail.msg);
    throw error;
  }
}

export async function getLinkClicks(short_code) {
  try {
    const response = await api.get(`/stats/${short_code}`);
    return response.data;
  } catch (error) {
    console.error(error.data.detail.msg);
    throw error;
  }
}
