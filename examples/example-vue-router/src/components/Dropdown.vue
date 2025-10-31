<template>
  <div class="dropdown" @click="toggleDropdown">
    <button class="dropdown-toggle">
      <slot name="toggle">{{ label }}</slot>
      <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <slot name="menu">
        <router-link
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          active-class="active"
          @click="closeDropdown"
        >
          {{ item.label }}
        </router-link>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};
</script>

<style scoped>
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
</style>
