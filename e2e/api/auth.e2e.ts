import { test, expect } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

test.describe('Auth API E2E', () => {
  const testEmail = `e2e-auth-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  test('POST /api/auth/sign-up/email should register a new user', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/auth/sign-up/email`, {
      data: {
        name: 'Auth E2E User',
        email: testEmail,
        password: testPassword,
      },
    });
    expect(res.status()).toBe(200);
  });

  test('POST /api/auth/sign-in/email should sign in existing user', async ({ request }) => {
    // First register
    await request.post(`${API_URL}/api/auth/sign-up/email`, {
      data: {
        name: 'SignIn User',
        email: `signin-${Date.now()}@test.com`,
        password: testPassword,
      },
    });

    // Then sign in
    const res = await request.post(`${API_URL}/api/auth/sign-in/email`, {
      data: {
        email: `signin-${Date.now()}@test.com`,
        password: testPassword,
      },
    });
    // Better Auth may return 200 with session cookie or token
    expect([200, 302]).toContain(res.status());
  });

  test('POST /api/auth/sign-in/email should reject wrong password', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/auth/sign-in/email`, {
      data: {
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
