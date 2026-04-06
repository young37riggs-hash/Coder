import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const projectRoot = resolve(__dirname);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    dir: projectRoot,
    include: ['packages/**/src/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'packages/core/src/**/*.ts',
        'packages/services/src/**/*.ts',
        'packages/channels/src/**/*.ts',
        'packages/enterprise/src/**/*.ts',
        'packages/observability/src/**/*.ts',
        'packages/devtools/src/**/*.ts',
        'packages/plugin-sdk/src/**/*.ts',
        'packages/assistant/src/**/*.ts',
      ],
      exclude: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts',
      ],
      all: true,
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
        perFile: true,
      },
    },
  },
});
