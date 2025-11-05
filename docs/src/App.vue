<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch" :base="basePath">
    <AppRoutes />
  </Router>
</template>

<script setup>
import { Router } from 'wouter-vue';
import AppRoutes from './components/AppRoutes.vue';
import { computed } from 'vue';

// SSR support: get ssrPath from props if available
const props = defineProps({
  ssrPath: {
    type: String,
    default: undefined
  },
  ssrSearch: {
    type: String,
    default: undefined
  }
});

// Get base path from Vite's BASE_URL or window location
// Remove trailing slash if present (Router expects base without trailing slash)
let basePath = '';
try {
  // Try to get from import.meta.env (available in Vite builds)
  basePath = import.meta.env.BASE_URL || '';
} catch (e) {
  // Fallback: use process.env for SSR
  if (process.env.GITHUB_PAGES === 'true') {
    basePath = '/wouter-vue';
  }
}
if (basePath.endsWith('/')) {
  basePath = basePath.slice(0, -1);
}
</script>
