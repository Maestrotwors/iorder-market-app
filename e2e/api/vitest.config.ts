/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    testTimeout: 15_000,
    hookTimeout: 30_000,
    sequence: {
      // Run auth tests before products (products depend on auth token)
      setupFiles: [],
    },
  },
});
