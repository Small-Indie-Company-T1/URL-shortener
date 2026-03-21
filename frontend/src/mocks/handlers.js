import { http, HttpResponse } from 'msw';

// "база данных"
let currentAccessToken = 'valid-token';
let currentRefreshToken = 'refresh-123';

export const handlers = [
  http.post('/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'a@a.com' && password === '123456') {
      currentAccessToken = 'valid-token';

      return new HttpResponse(
        JSON.stringify({
          accessToken: currentAccessToken,
        }),
        {
          status: 200,
          headers: {
            'Set-Cookie': `refreshToken=${'refresh-123'}; httpOnly; Path=/`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/logout', () => {
    currentAccessToken = null;
    currentRefreshToken = null;
    return new HttpResponse(null, {
      status: 200,
      headers: { 'Set-Cookie': 'refreshToken=; Max-Age=0; Path=/' },
    });
  }),

  http.post('/refresh', ({ cookies }) => {
    const refreshToken = cookies.refreshToken;

    if (refreshToken === currentRefreshToken) {
      return HttpResponse.json({
        accessToken: 'new-token-' + Date.now(),
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),
];
