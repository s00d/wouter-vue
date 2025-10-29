<template>
  <div class="page" data-testid="route-page">
    <h1>Route 96</h1>
    <p>This is a test route for performance comparison</p>
    <div class="nav-links">
      <Link href="/route97" class="nav-link">Next: Route 97 →</Link>
      <Link href="/" class="nav-link">Back to Home</Link>
    </div>
  </div>
</template>

<script setup>
import { Link } from 'wouter-vue';
</script>

<style scoped>
.page {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.nav-links {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>
