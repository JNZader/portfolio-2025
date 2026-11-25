import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Runs the corpus bridge outside the happy-dom suite. The root Vitest
 * config excludes `ml/**`, so this file is the only way in.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['ml/scripts/qa-bridge.entry.ts'],
    setupFiles: [],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
    },
  },
});
