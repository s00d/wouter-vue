import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Default environment for unit tests
    environment: 'happy-dom',
    // Browser tests are now run separately via Playwright (see test:browser script)
    // Run only unit tests
    include: ['test/**/*.{ts,js}'],
  },
  resolve: {
    alias: {
      'vue-deps': resolve(__dirname, './src/vue-deps.ts'),
    },
  },
})
