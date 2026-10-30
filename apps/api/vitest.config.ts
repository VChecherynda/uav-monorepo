import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
    },
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', '**/*.integration.test.ts', 'node_modules/**'],
    env: { JWT_SECRET: 'test-secret' },
  },
});
