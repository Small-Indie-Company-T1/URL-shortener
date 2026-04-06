import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/links',
  withCredentials: true,
});

export async function createLink(original_url) {
  try {
    const response = await api.post('/create', { original_url });
    return response.data.short_code;
  } catch (error) {
    console.error('Ошибка генерации ссылки:', error.status);
    throw error;
  }
}
