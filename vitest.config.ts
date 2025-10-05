import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['packages/**/__tests__/**/*.test.ts'],

    // Global test APIs (describe, it, expect without imports)
    globals: true,

    // Test environment
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',

      // Coverage thresholds (enforced in CI)
      // Note: Current baseline is ~66%. Target is 80% for new code.
      // These thresholds prevent regression below current coverage levels.
      thresholds: {
        lines: 65,
        functions: 65,
        branches: 70,
        statements: 65,
      },

      // Files to include in coverage
      include: ['packages/**/src/**/*.ts'],

      // Files to exclude from coverage
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__tests__/**',
        '**/types.ts',
        '**/index.ts',
        '**/*.config.ts',
        '**/mocks/**',
      ],
    },

    // Workspace support for monorepo
    // Run tests for all packages
    // Each package can have its own vitest.config.ts if needed
  },
});
