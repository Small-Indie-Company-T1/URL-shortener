import { http, HttpResponse } from 'msw';

// "база данных"
let users = [];
let currentAccessToken = 'valid-token';
let currentRefreshToken = 'refresh-123';

export const handlers = [
  http.post('/auth/register', async ({ request }) => {
    const { email, nickname, password } = await request.json();
    if (!email || !nickname || !password) {
      return new HttpResponse(
        JSON.stringify({ email: email, name: nickname, password: password }),
        { status: 400 }
      );
    }
    if (users.every((user) => user.email !== nickname)) {
      users.push({ email, nickname, password });
      return new HttpResponse(null, { status: 201 });
    } else {
      return new HttpResponse(null, { status: 409 });
    }
  }),

  http.post('/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (
      users.some((user) => user.email === email && user.password === password)
    ) {
      currentAccessToken = 'valid-token';

      return new HttpResponse(
        JSON.stringify({
          access_token: currentAccessToken,
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

  http.post('/auth/logout', () => {
    currentAccessToken = null;
    currentRefreshToken = null;
    return new HttpResponse(null, {
      status: 200,
      headers: { 'Set-Cookie': 'refreshToken=; Max-Age=0; Path=/' },
    });
  }),

  http.post('/auth/refresh', ({ cookies }) => {
    const refreshToken = cookies.refreshToken;

    if (refreshToken === currentRefreshToken) {
      return HttpResponse.json({
        accessToken: 'new-token-' + Date.now(),
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/links/create', async ({ request }) => {
    try {
      const { original_url } = await request.json();
      if (!original_url) {
        return new HttpResponse(null, { status: 400 });
      }

      if (original_url.length > 100) {
        return new HttpResponse(null, { status: 422 });
      }
      return new HttpResponse(
        JSON.stringify({ id: '42', short_code: '42zxc67' }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.log(error.message);
      return new HttpResponse(null, { status: 500 });
    }
  }),
  http.post('/links/42/qr', async () => {
    const response = await fetch('/QR_code.svg');
    const blob = await response.blob();

    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }),
];
