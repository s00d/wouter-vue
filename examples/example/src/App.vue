<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch">
    <div id="app">
      <Navigation />

      <main class="container">
        <AppRoutes />
      </main>
    </div>
  </Router>
</template>

<script setup>
import { Router } from 'wouter-vue';
import Navigation from './components/Navigation.vue';
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
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
