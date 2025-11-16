import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/export.ts', 'src/update.ts', '**/*.spec.ts', '**/*.fixture.ts'],
    },
  },
});
