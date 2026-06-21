import { defineConfig } from 'vitest/config';

// Standalone config so Vitest does not inherit the frontend's vite.config.ts
// from the parent directory.
export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
