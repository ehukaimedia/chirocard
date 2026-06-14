import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test config kept separate from vite.config.ts so the production build stays
// untouched. Run with `npm test` (vitest run) or `npm run test:watch`.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
})
