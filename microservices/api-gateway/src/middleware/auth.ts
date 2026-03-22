import { Elysia } from 'elysia';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { serviceUrl } from '../../../../config';

const AUTH_JWKS_URL = `${serviceUrl('auth')}/api/auth/jwks`;
const jwks = createRemoteJWKSet(new URL(AUTH_JWKS_URL));

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Auth middleware using Elysia macro pattern.
 *
 * Verifies JWT using JWKS public keys from auth-service (fetched once, cached by jose).
 * No per-request calls — pure local crypto verification after initial key fetch.
 *
 * Usage:
 *   .use(authMiddleware)
 *   .get('/protected', ({ user }) => user, { auth: true })
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const authHeader = headers.get('authorization');

      if (!authHeader?.startsWith('Bearer ')) {
        return status(401);
      }

      const token = authHeader.slice(7);

      try {
        const { payload } = await jwtVerify(token, jwks);

        return {
          user: {
            id: payload.sub ?? '',
            email: (payload.email as string) ?? '',
            role: (payload.role as string) ?? 'customer',
          } satisfies AuthUser,
        };
      } catch {
        return status(401);
      }
    },
  },
});
