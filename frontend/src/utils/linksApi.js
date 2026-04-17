import { createApi } from './apiClient.js';

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
    const response = await linksApi.get(
      (`/${url_id}/qr?fmt=${format}`,
      {
        responseType: 'blob',
      }
    ));
    return response.data;
  } catch (error) {
    console.error('Ошибка генерации QR-кода: ', error.status);
    throw error;
  }
}

export async function getLinksList(offset, limit = 10) {
  try {
    const response = await linksApi.get('/', { offset: offset, limit: limit });
    return response.data;
  } catch (error) {
    console.error(error.data.detail.msg);
    throw error;
  }
}
