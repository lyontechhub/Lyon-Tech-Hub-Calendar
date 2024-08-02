import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', '**/*.spec.ts', '**/*.fixture.ts'],
    },
  },
});
