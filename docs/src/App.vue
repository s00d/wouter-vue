<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch" :base="basePath">
    <AppRoutes />
  </Router>
</template>

<script setup>
import { Router } from 'wouter-vue';
import AppRoutes from './components/AppRoutes.vue';

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

// Get base path from Vite's BASE_URL
// Vite guarantees this variable is available on both client and server
// Remove trailing slash (Router expects base without trailing slash)
const basePath = (import.meta.env.BASE_URL || '').replace(/\/$/, '');
</script>
