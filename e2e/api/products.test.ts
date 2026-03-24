import { describe, it, expect, beforeAll } from 'vitest';
import { API_URL, getAuthToken } from './helpers';

describe('Products API', () => {
  let authToken: string | null = null;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  /** Build Authorization header when token is available */
  const authHeaders = () => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

  // ----------------------------------------------------------------
  // Unauthenticated access
  // ----------------------------------------------------------------

  describe('unauthenticated', () => {
    it('GET /api/products should return 401 without auth token', async () => {
      const res = await fetch(`${API_URL}/api/products`);

      expect(res.status).toBe(401);
    });

    it('GET /api/products/:id should return 401 without auth token', async () => {
      const res = await fetch(`${API_URL}/api/products/some-id`);

      expect(res.status).toBe(401);
    });
  });

  // ----------------------------------------------------------------
  // Authenticated access — product listing
  // ----------------------------------------------------------------

  describe('authenticated — listing', () => {
    it('GET /api/products should return paginated product list', async () => {
      if (!authToken) return; // Skip if auth unavailable

      const res = await fetch(`${API_URL}/api/products`, {
        headers: authHeaders(),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
      expect(body.pagination).toHaveProperty('total');
      expect(body.pagination).toHaveProperty('page');
      expect(body.pagination).toHaveProperty('limit');
      expect(body.pagination).toHaveProperty('totalPages');
    });

    it('GET /api/products should respect page and limit query params', async () => {
      if (!authToken) return;

      const res = await fetch(`${API_URL}/api/products?page=1&limit=1`, {
        headers: authHeaders(),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(1);
      expect(body.data.length).toBeLessThanOrEqual(1);
    });

    it('GET /api/products should support search query', async () => {
      if (!authToken) return;

      const res = await fetch(`${API_URL}/api/products?search=headphones`, {
        headers: authHeaders(),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  // ----------------------------------------------------------------
  // Authenticated access — single product
  // ----------------------------------------------------------------

  describe('authenticated — single product', () => {
    it('GET /api/products/:id should return a product by ID', async () => {
      if (!authToken) return;

      // Known mock product ID from products-service
      const knownId = '550e8400-e29b-41d4-a716-446655440001';

      const res = await fetch(`${API_URL}/api/products/${knownId}`, {
        headers: authHeaders(),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(knownId);
      expect(body.data.name).toBeDefined();
      expect(body.data.price).toBeDefined();
    });

    it('GET /api/products/:id should return not found for invalid ID', async () => {
      if (!authToken) return;

      const res = await fetch(`${API_URL}/api/products/nonexistent-id`, {
        headers: authHeaders(),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.message).toBeDefined();
    });
  });

  // ----------------------------------------------------------------
  // Authenticated access — create product
  // ----------------------------------------------------------------

  describe('authenticated — create product', () => {
    it('POST /api/products should create a new product', async () => {
      if (!authToken) return;

      const newProduct = {
        name: `Test Product ${Date.now()}`,
        description: 'Created by API integration test',
        price: 42.99,
        categoryId: '550e8400-e29b-41d4-a716-446655440010',
      };

      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(newProduct),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.name).toBe(newProduct.name);
      expect(body.data.price).toBe(newProduct.price);
    });

    it('POST /api/products should reject invalid body (missing required fields)', async () => {
      if (!authToken) return;

      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ name: '' }),
      });

      // Zod validation error
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
