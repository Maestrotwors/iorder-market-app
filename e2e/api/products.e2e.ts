import { test, expect } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

test.describe('Products API E2E', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Register a test user
    await request.post(`${API_URL}/api/auth/sign-up/email`, {
      data: {
        name: 'E2E Test User',
        email: `e2e-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      },
    });

    // Sign in to get a token
    const signInRes = await request.post(`${API_URL}/api/auth/sign-in/email`, {
      data: {
        email: `e2e-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      },
    });

    // Try to get token from auth/token endpoint
    const tokenRes = await request.get(`${API_URL}/api/auth/token`, {
      headers: signInRes.headers()['set-cookie']
        ? { cookie: signInRes.headers()['set-cookie'] }
        : {},
    });

    if (tokenRes.ok()) {
      const tokenBody = await tokenRes.json();
      authToken = tokenBody.token;
    }
  });

  test('GET /api/products should require auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/products`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/products should return products with valid token', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const res = await request.get(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.pagination).toHaveProperty('total');
    expect(body.pagination).toHaveProperty('page');
  });
});
