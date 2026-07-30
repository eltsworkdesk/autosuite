import { defineConfig } from 'vitest/config';

// Without an explicit include, vitest walks the whole tree and picks up any
// stray copy of the repo — a leftover git worktree under .claude/ was making
// every suite run twice, doubling the reported test count. The unit tests all
// live in tests/, so scope to that.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
  },
});
