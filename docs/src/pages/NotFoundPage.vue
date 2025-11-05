<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link href="/">Go back home</Link>
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
  color: #666;
}
</style>
