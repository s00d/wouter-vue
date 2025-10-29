<template>
  <div class="page" data-testid="home-page">
    <h1>Home Page</h1>
    <p>Welcome to wouter-vue demo!</p>
    
    <div class="features">
      <h2>Features</h2>
      <ul>
        <li>🚀 Tiny router (~2KB)</li>
        <li>🎯 Vue 3 Composition API</li>
        <li>📘 TypeScript support</li>
        <li>⚡ Async component loading</li>
        <li>🔗 Active links</li>
        <li>🧭 Programmatic navigation</li>
      </ul>
    </div>
    
    <div class="quick-start">
      <h2>Quick Start</h2>
      <p>Navigate using the menu above or click on links below:</p>
      
      <div class="links">
        <Link href="/about">About Page</Link>
        <Link href="/users">Users List</Link>
        <Link href="/heavy">Heavy Page (Async)</Link>
        <Link href="/route1">Test Routes (1-200)</Link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Link } from 'wouter-vue';
</script>

<style scoped>
.page {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

h2 {
  color: #334155;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.features ul,
.quick-start p {
  color: #64748b;
  line-height: 1.8;
  margin-top: 1rem;
}

.features li {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.links a {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.links a:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>

