<template>
  <nav class="navigation">
    <div class="nav-links">
      <Link 
        href="/" 
        :class="isActive => isActive ? 'active' : ''"
      >
        Home
      </Link>
      <Link 
        href="/about" 
        :class="isActive => isActive ? 'active' : ''"
      >
        About
      </Link>
      
      <div class="dropdown" @click="toggleDropdown">
        <button class="dropdown-toggle">
          Users
          <span class="dropdown-arrow" :class="{ open: isDropdownOpen }">▼</span>
        </button>
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <Link 
            href="/users" 
            :class="isActive => isActive ? 'active' : ''"
            @click="closeDropdown"
          >
            Users List
          </Link>
          <Link 
            href="/users/1" 
            :class="isActive => isActive ? 'active' : ''"
            @click="closeDropdown"
          >
            User Details
          </Link>
        </div>
      </div>
      
      <Link 
        href="/heavy" 
        :class="isActive => isActive ? 'active' : ''"
      >
        Heavy (Async)
      </Link>
    </div>
    
    <div class="current-path">
      Current: {{ displayLocation }}
    </div>
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link, useLocation } from 'wouter-vue';

const [location] = useLocation();
const displayLocation = computed(() => location.value || 'loading...');

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};
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

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: inherit;
  font-family: inherit;
}

.dropdown-toggle:hover {
  background: #f0f0f0;
  color: #333;
}

.dropdown-arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-menu a {
  display: block;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #666;
  transition: all 0.2s;
  border: none;
  border-radius: 0;
}

.dropdown-menu a:hover {
  background: #f8f9fa;
  color: #333;
}

.dropdown-menu a.active {
  background: #4f46e5;
  color: white;
}

.current-path {
  color: #888;
  font-size: 0.9rem;
}
</style>

