<template>
  <nav class="navigation">
    <div class="nav-links">
      <Link href="/">
        <template #default="{ isActive }">
          <a :class="{ active: isActive }">Home</a>
        </template>
      </Link>
      <Link href="/about">
        <template #default="{ isActive }">
          <a class="test" :class="{ active: isActive }">About</a>
        </template>
      </Link>
      
      <Dropdown
        label="Users"
        :items="[
          { href: '/users', label: 'Users List' },
          { href: '/users/1', label: 'User Details' }
        ]"
      />
      
      <Link href="/heavy">
        <template #default="{ isActive }">
          <a :class="{ active: isActive }">Heavy (Async)</a>
        </template>
      </Link>
    </div>
    
    <div class="current-path">
      Current: {{ displayLocation }}
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { Link, useLocation } from 'wouter-vue';
import Dropdown from './Dropdown.vue';

const [location] = useLocation();
const displayLocation = computed(() => location.value || 'loading...');
</script>

<style scoped>
.navigation {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-links a:hover {
  background: #f0f0f0;
  color: #333;
}

.nav-links a.active {
  background: #4f46e5;
  color: white;
}

.current-path {
  color: #888;
  font-size: 0.9rem;
}
</style>

