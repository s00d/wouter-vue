<template>
  <nav class="navigation">
    <div class="nav-links">
      <router-link to="/" active-class="active">
        Home
      </router-link>
      <router-link to="/about" active-class="active">
        About
      </router-link>

      <Dropdown
        label="Users"
        :items="[
          { to: '/users', label: 'Users List' },
          { to: '/users/1', label: 'User Details' }
        ]"
      />

      <router-link to="/heavy" active-class="active">
        Heavy (Async)
      </router-link>
    </div>

    <div class="current-path">
      Current: {{ currentPath }}
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Dropdown from './Dropdown.vue';

const route = useRoute();
const currentPath = computed(() => route.path || 'loading...');
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
