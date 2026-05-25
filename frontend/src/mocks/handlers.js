import { http, HttpResponse } from 'msw';

// "база данных"
let users = [{ email: 'kirka1408kirka@gmail.com', password: 'admin' }];
let links = [
  {
    id: 1,
    original_url: 'https://google.com',
    short_code: 'vsf567',
    created_at: '2026-04-26',
    is_active: true,
    is_deleted: false,
  },
  {
    id: 2,
    original_url: 'https://google.com',
    short_code: 'hfsu72',
    created_at: '2026-04-26',
    is_active: true,
    is_deleted: false,
  },
];
let clicks = [
  {
    link_id: 1,
    user_agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    referred_form: 'http://localhost:8100/docs',
    ip_address: '172.18.0.1',
    clicked_at: '2026-04-16 19:21:56.194130 +00:00',
  },
];

let currentAccessToken = 'valid-token';
let currentRefreshToken = 'refresh-123';

export const handlers = [
  http.post('/auth/register', async ({ request }) => {
    const data = await request.json();
    const email = data.email;
    const password = data.password;
    const nickname = data.nickname || data.name;

    if (!email || !nickname || !password) {
      return new HttpResponse(
        JSON.stringify({
          error: 'Missing fields',
          received: { email, nickname, password },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (users.every((user) => user.email !== email)) {
      users.push({ email, nickname, password });
      console.log('Пользователь успешно создан:', users);
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
            'Set-Cookie': `refreshToken=refresh-123; httpOnly; Path=/`,
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

    currentAccessToken = 'new-token-' + Date.now();
    if (refreshToken === currentRefreshToken) {
      return new HttpResponse(
        JSON.stringify({
          access_token: currentAccessToken,
          token_type: 'bearer',
        }),
        {
          status: 200,
          headers: {
            'Set-Cookie': `refreshToken=refresh-123; httpOnly; Path=/`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/links/create', async ({ request }) => {
    try {
      const { original_url } = await request.json();
      if (!original_url) {
        return new HttpResponse(null, { status: 400 });
      }

      if (original_url.length > 100 || !/^https?:\/\/\S+$/.test(original_url)) {
        return new HttpResponse(null, { status: 422 });
      }

      const code = Math.floor(Math.random() * 1000000).toString(6);
      links.push({
        id: Math.floor(Math.random() * 200000),
        original_url: original_url,
        short_code: code,
        created_at: '2026-04-26',
        is_active: true,
        is_deleted: false,
      });
      return new HttpResponse(
        JSON.stringify({
          id: '42',
          short_code: code,
        }),
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
  http.get(/\/links\/.+\/qr/, async ({ request }) => {
    const fmt = new URL(request.url).searchParams.get('fmt');
    const response = await fetch(`/QR_code.${fmt}`);
    const blob = await response.blob();

    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': `image/${fmt === 'svg' ? 'svg+xml' : 'png'}`,
      },
    });
  }),
  http.get('/links', async ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit'));
    const offset = Number(url.searchParams.get('offset'));
    if (
      request.headers.get('Authorization') ===
      'Bearer ' + currentAccessToken
    ) {
      return new HttpResponse(
        JSON.stringify({
          links: links
            .filter((elem) => !elem.is_deleted)
            .slice(offset, offset + limit),
          total: links.length,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return new HttpResponse(null, { status: 401 });
    }
  }),
  http.delete('/links/:short_code', async ({ params }) => {
    const { short_code } = params;
    const link = links.find((l) => l.short_code === short_code);
    if (!link) {
      return new HttpResponse(null, { status: 404 });
    }
    link.is_deleted = true;
    return new HttpResponse(null, { status: 200 });
  }),
  http.get('/links/stats/:short_code', async ({ params }) => {
    const { short_code } = params;
    const link = links.find((l) => l.id.toString() === short_code);
    if (!link || link.is_deleted) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(
      JSON.stringify({
        clicks: clicks.filter((el) => el.link_id.toString() === short_code),
      }),
      {
        status: 200,
      }
    );
  }),
];
