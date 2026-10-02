import { defineConfig } from 'vitest/config';
export default defineConfig({
  // Worktrees share node_modules through a junction. A cache inside each worktree stops parallel dev servers from deleting each other's optimized files.
  cacheDir: '.vite-cache',
  test: {include: ['tests/*.spec.ts']},
  build: {chunkSizeWarningLimit: 1000}
});
