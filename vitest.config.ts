import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    restoreMocks: true,
    setupFiles: ['./src/setup.ts'],
    include: ['**/*.{test,spec,e2e}.ts'],
  },
});
