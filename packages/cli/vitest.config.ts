import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns for CLI package
    include: ['__tests__/**/*.test.ts'],

    // Global test APIs (describe, it, expect without imports)
    globals: true,

    // Test environment
    environment: 'node',
  },
});
