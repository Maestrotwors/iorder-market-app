import { defineConfig } from 'vitest/config';
import { vitestApplicationBuilder } from '@analogjs/vitest-angular';

export default defineConfig({
  plugins: [vitestApplicationBuilder()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
