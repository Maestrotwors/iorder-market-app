import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { config } from '../../../config';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: `http://localhost:${config.services.auth.port}`,
  basePath: '/api/auth',
  secret: config.jwt.secret,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: true,
      },
    },
  },
  plugins: [jwt()],
  trustedOrigins: config.cors.origins,
  advanced: {
    cookiePrefix: 'iorder',
    useSecureCookies: process.env['NODE_ENV'] === 'production',
  },
});
