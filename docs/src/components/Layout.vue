<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shrink-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <Link href="/" class="text-2xl font-bold text-gray-900">
              wouter-vue
            </Link>
            <span class="ml-3 text-sm text-gray-500">Documentation</span>
          </div>
          <nav class="hidden md:flex items-center space-x-4">
            <Link href="/getting-started" class="text-gray-600 hover:text-gray-900">Getting Started</Link>
            <Link href="/api/composables/use-location" class="text-gray-600 hover:text-gray-900">API</Link>
            <Link href="/guides/route-patterns" class="text-gray-600 hover:text-gray-900">Guides</Link>
            <button
              @click="openSearch"
              class="flex items-center text-gray-600 hover:text-gray-900 group"
              aria-label="Open search"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="hidden sm:inline">Search</span>
              <kbd class="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                <span class="text-xs">⌘</span>K
              </kbd>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main container with sidebar and content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar - Fixed on desktop -->
      <aside class="hidden lg:block w-64 bg-white border-r border-gray-200 shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      <!-- Mobile sidebar toggle -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Toggle sidebar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Mobile sidebar overlay -->
      <div
        v-if="sidebarOpen"
        class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="sidebarOpen = false"
      ></div>

      <!-- Mobile sidebar -->
      <aside
        v-if="sidebarOpen"
        class="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40"
      >
        <Sidebar />
      </aside>

      <!-- Main content area -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
            <slot />
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600 text-sm">
          <p>Built with wouter-vue • <a href="https://github.com/s00d/wouter-vue" class="text-blue-600 hover:text-blue-800">GitHub</a></p>
        </div>
      </div>
    </footer>

    <!-- Search Modal -->
    <SearchModal :is-open="searchOpen" @close="searchOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link } from 'wouter-vue';
import Sidebar from './Sidebar.vue';
import SearchModal from './SearchModal.vue';

const sidebarOpen = ref(false);
const searchOpen = ref(false);

function openSearch() {
  searchOpen.value = true;
}

function handleKeydown(event) {
  // Cmd+K or Ctrl+K to open search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    openSearch();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>

