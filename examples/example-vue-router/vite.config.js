import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-router': 'vue-router',
    },
  },
  server: {
    port: 5174,
    fs: {
      strict: false,
    },
  },
  ssr: {
    noExternal: ['vue-router'],
  }
});

