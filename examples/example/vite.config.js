import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// import { vitePluginRoutes } from '../../src/vite-plugin-routes.js';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'wouter-vue': resolve(__dirname, '../../src/index.js'),
    },
  },
  server: {
    port: 5173,
    fs: {
      strict: false,
    },
  },
  ssr: {
    noExternal: ['wouter-vue'],
  }
});

