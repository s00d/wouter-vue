<template>
  <div class="not-found">
    <h1 class="text-gray-900 dark:text-gray-100">404 - Page Not Found</h1>
    <p class="text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist.</p>
    <Link href="/" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Go back home</Link>
  </div>
</template>

<script setup>
import { Link } from 'wouter-vue';
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.not-found :deep(a) {
  text-decoration: none;
}

.not-found :deep(a):hover {
  text-decoration: underline;
}
</style>
