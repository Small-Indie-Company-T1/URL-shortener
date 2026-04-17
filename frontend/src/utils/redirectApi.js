import { api } from './apiClient.js';

export async function redirectUrl(short_code) {
  try {
    await api.get(`redirect/${short_code}`);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
