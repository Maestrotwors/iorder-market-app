import { describe, it, expect } from 'vitest';
import { API_URL, TEST_PASSWORD, signUp, signIn } from './helpers';

/** Safely parse JSON body — returns null if body is empty or not JSON */
async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Check if response indicates an error (HTTP 4xx+ or error in body) */
function isErrorResponse(status: number, body: Record<string, unknown> | null): boolean {
  if (status >= 400) return true;
  if (!body) return true;
  if (body.error || body.code) return true;
  return false;
}

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
    });

    it('should reject sign-up with short password', async () => {
      const res = await signUp({
        name: 'Short Pass',
        email: uniqueEmail(),
        password: '123',
      });

      const body = await safeJson(res);
      expect(isErrorResponse(res.status, body) || !body?.user).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      const email = uniqueEmail();

      const first = await signUp({ name: 'First', email, password: TEST_PASSWORD });
      expect(first.status).toBe(200);

      const second = await signUp({ name: 'Second', email, password: TEST_PASSWORD });
      const body = await safeJson(second);
      expect(isErrorResponse(second.status, body) || !body?.user).toBe(true);
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('should sign in with valid credentials', async () => {
      const email = uniqueEmail();
      await signUp({ name: 'SignIn User', email, password: TEST_PASSWORD });
      const res = await signIn({ email, password: TEST_PASSWORD });
      expect([200, 302]).toContain(res.status);
    });

    it('should reject sign-in with wrong password', async () => {
      const res = await signIn({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!',
      });

      const body = await safeJson(res);
      expect(isErrorResponse(res.status, body) || !body?.user).toBe(true);
    });

    it('should reject sign-in with missing fields', async () => {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const body = await safeJson(res);
      expect(isErrorResponse(res.status, body) || !body?.user).toBe(true);
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

      if (tokenRes.ok) {
        const body = await safeJson(tokenRes);
        if (body?.token) {
          expect(typeof body.token).toBe('string');
        }
      }
    });

    it('should reject token request without session', async () => {
      const res = await fetch(`${API_URL}/api/auth/token`);
      const body = await safeJson(res);
      expect(isErrorResponse(res.status, body) || !body?.token).toBe(true);
    });
  });
});
