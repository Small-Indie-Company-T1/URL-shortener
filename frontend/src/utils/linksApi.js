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

export async function createQrCode(short_code, format) {
  try {
    const response = await linksApi.post(
      `/${short_code}/qr`,
      { format: format, short_code: short_code },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка генерации QR-кода: ', error.data.detail.msg);
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
