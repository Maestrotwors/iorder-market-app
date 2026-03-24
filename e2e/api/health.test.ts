import { describe, it, expect } from 'vitest';
import { API_URL } from './helpers';

describe('Health Check', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await fetch(`${API_URL}/api/health`);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api-gateway');
    expect(body.timestamp).toBeTruthy();
  });

  it('GET / should return API gateway service info', async () => {
    const res = await fetch(`${API_URL}/`);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.name).toBe('iOrder Market API');
    expect(body.version).toBeDefined();
    expect(body.endpoints).toHaveProperty('health');
    expect(body.endpoints).toHaveProperty('products');
    expect(body.endpoints).toHaveProperty('auth');
  });

  it('GET /api/health response should include valid ISO timestamp', async () => {
    const res = await fetch(`${API_URL}/api/health`);
    const body = await res.json();

    const parsed = Date.parse(body.timestamp);
    expect(parsed).not.toBeNaN();
  });
});
