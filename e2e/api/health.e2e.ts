import { test, expect } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

test.describe('Health Check E2E', () => {
  test('API Gateway should be healthy', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api-gateway');
    expect(body.timestamp).toBeTruthy();
  });

  test('API Gateway root should return service info', async ({ request }) => {
    const res = await request.get(`${API_URL}/`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.name).toBe('iOrder Market API');
    expect(body.endpoints).toHaveProperty('health');
    expect(body.endpoints).toHaveProperty('products');
    expect(body.endpoints).toHaveProperty('auth');
  });
});
