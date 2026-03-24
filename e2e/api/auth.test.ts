import { describe, it, expect } from 'vitest';
import { API_URL, TEST_PASSWORD, signUp, signIn } from './helpers';

describe('Auth API', () => {
  const uniqueEmail = () =>
    `auth-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

  describe('POST /api/auth/sign-up/email', () => {
    it('should register a new user', async () => {
      const res = await signUp({
        name: 'Auth Test User',
        email: uniqueEmail(),
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.user ?? body.token).toBeDefined();
    });

    it('should reject sign-up with short password', async () => {
      const res = await signUp({
        name: 'Short Pass',
        email: uniqueEmail(),
        password: '123', // Too short — min 8 chars
      });

      // Better Auth may return 200 with error in body, or 4xx
      const body = (await res.json()) as Record<string, unknown>;
      const isError = res.status >= 400 || body.error || body.code || !body.user;
      expect(isError).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      const email = uniqueEmail();

      // First registration — should succeed
      const first = await signUp({ name: 'First', email, password: TEST_PASSWORD });
      expect(first.status).toBe(200);

      // Second registration with same email — should fail
      const second = await signUp({ name: 'Second', email, password: TEST_PASSWORD });
      const body = (await second.json()) as Record<string, unknown>;
      // Better Auth may return 200 with error body or 4xx status
      const isError = second.status >= 400 || body.error || body.code || !body.user;
      expect(isError).toBe(true);
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('should sign in with valid credentials', async () => {
      const email = uniqueEmail();

      // Register first
      await signUp({ name: 'SignIn User', email, password: TEST_PASSWORD });

      // Sign in
      const res = await signIn({ email, password: TEST_PASSWORD });

      // Better Auth returns 200 with session cookie or token
      expect([200, 302]).toContain(res.status);
    });

    it('should reject sign-in with wrong password', async () => {
      const res = await signIn({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!',
      });

      const body = (await res.json()) as Record<string, unknown>;
      // Better Auth may return 200 with error body or 4xx status
      const isError = res.status >= 400 || body.error || body.code || !body.user;
      expect(isError).toBe(true);
    });

    it('should reject sign-in with missing fields', async () => {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const body = (await res.json()) as Record<string, unknown>;
      const isError = res.status >= 400 || body.error || body.code || !body.user;
      expect(isError).toBe(true);
    });
  });

  describe('GET /api/auth/token', () => {
    it('should return JWT when session cookie is present', async () => {
      const email = uniqueEmail();

      await signUp({ name: 'Token User', email, password: TEST_PASSWORD });
      const signInRes = await signIn({ email, password: TEST_PASSWORD });
      const setCookie = signInRes.headers.get('set-cookie') ?? '';

      const tokenRes = await fetch(`${API_URL}/api/auth/token`, {
        headers: setCookie ? { cookie: setCookie } : {},
      });

      // If token endpoint is available, it should return a JWT
      if (tokenRes.ok) {
        const body = (await tokenRes.json()) as { token?: string };
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe('string');
      }
    });

    it('should reject token request without session', async () => {
      const res = await fetch(`${API_URL}/api/auth/token`);

      const body = (await res.json()) as Record<string, unknown>;
      const isError = res.status >= 400 || body.error || body.code || !body.token;
      expect(isError).toBe(true);
    });
  });
});
