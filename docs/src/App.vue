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
const basePath = import.meta.env.BASE_URL || '';
</script>
