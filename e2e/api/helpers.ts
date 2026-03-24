/**
 * Shared helpers for API integration tests.
 *
 * All tests perform REAL HTTP requests against a running API Gateway.
 * No mocking — the full microservice stack must be up.
 */

export const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

/** Default credentials used across test suites */
export const TEST_PASSWORD = 'TestPassword123!';

/**
 * Register a new user via Better Auth sign-up endpoint.
 * Returns the raw Response so callers can inspect status, headers, and body.
 */
export async function signUp(data: { name: string; email: string; password: string }) {
  return fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Sign in a user and return the raw Response.
 */
export async function signIn(data: { email: string; password: string }) {
  return fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Register + sign-in + obtain JWT token.
 * Combines the full auth flow into a single helper for tests that need a Bearer token.
 *
 * Returns `null` if the token could not be obtained (e.g. auth-service is down).
 */
export async function getAuthToken(): Promise<string | null> {
  const email = `api-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

  // 1. Register
  await signUp({ name: 'API Test User', email, password: TEST_PASSWORD });

  // 2. Sign in — capture session cookie
  const signInRes = await signIn({ email, password: TEST_PASSWORD });
  const setCookie = signInRes.headers.get('set-cookie') ?? '';

  // 3. Exchange session cookie for JWT via /api/auth/token
  const tokenRes = await fetch(`${API_URL}/api/auth/token`, {
    headers: setCookie ? { cookie: setCookie } : {},
  });

  if (!tokenRes.ok) return null;

  const body = (await tokenRes.json()) as { token?: string };
  return body.token ?? null;
}
