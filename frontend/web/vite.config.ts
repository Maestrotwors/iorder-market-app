/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

const webRoot = resolve(__dirname);

export default defineConfig({
  root: webRoot,
  plugins: [
    angular({
      tsconfig: resolve(webRoot, 'tsconfig.spec.json'),
    }),
    tsconfigPaths({
      root: webRoot,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    server: {
      deps: {
        inline: [/@angular/, /@ngrx/],
      },
    },
  },
});
