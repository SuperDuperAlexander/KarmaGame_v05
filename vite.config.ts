import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {include: ['tests/*.spec.ts']},
  build: {chunkSizeWarningLimit: 1000}
});
