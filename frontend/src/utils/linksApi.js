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

export async function createQrCode(url_id) {
  try {
    const response = await linksApi.post(
      `/${url_id}/qr`,
      { format: 'svg' },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка генерации QR-кода: ', error.status);
    throw error;
  }
}
