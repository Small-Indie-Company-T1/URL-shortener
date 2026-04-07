import { createApi } from './apiClient.js';

const linksApi = createApi('/links');

export async function createLink(original_url) {
  try {
    const response = await linksApi.post('/create', { original_url });
    return response.data.short_code;
  } catch (error) {
    console.error('Ошибка генерации ссылки:', error.status);
    throw error;
  }
}
