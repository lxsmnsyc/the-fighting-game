import { defineConfig } from 'vitest/config';

// Separate from the Vite config: the Solid plugin would switch tests to
// a DOM environment the engine does not need
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
