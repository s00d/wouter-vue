<template>
  <nav class="p-4 bg-white dark:bg-gray-800">
    <ul class="space-y-2">
      <MenuItem 
        v-for="item in menuItems" 
        :key="item.path"
        :item="item"
        :level="0"
      />
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import menuData from '../menu.json';
import MenuItem from './MenuItem.vue';

const menuItems = computed(() => menuData.root || []);
</script>

<style scoped>
/* Custom scrollbar */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Dark mode scrollbar */
:global(.dark) nav::-webkit-scrollbar-thumb {
  background: #4b5563;
}

:global(.dark) nav::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
