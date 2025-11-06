<template>
  <div class="h-screen bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <Link href="/" class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              wouter-vue
            </Link>
            <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Documentation</span>
          </div>
          <nav class="hidden md:flex items-center space-x-4">
            <Link href="/getting-started" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Getting Started</Link>
            <Link href="/api/composables/use-location" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">API</Link>
            <Link href="/guides/route-patterns" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Guides</Link>
            <ThemeToggle />
            <button
              @click="openSearch"
              class="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 group"
              aria-label="Open search"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="hidden sm:inline">Search</span>
              <kbd class="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <span class="text-xs">⌘</span>K
              </kbd>
            </button>
          </nav>
          <!-- Mobile menu -->
          <div class="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              @click="openSearch"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              aria-label="Open search"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main container with sidebar and content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar - Fixed on desktop -->
      <aside class="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      <!-- Mobile sidebar toggle -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="lg:hidden fixed bottom-4 right-4 bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Toggle sidebar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Mobile sidebar overlay -->
      <div
        v-if="sidebarOpen"
        class="lg:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
        @click="sidebarOpen = false"
      ></div>

      <!-- Mobile sidebar -->
      <aside
        v-if="sidebarOpen"
        class="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40"
      >
        <Sidebar />
      </aside>

      <!-- Main content area -->
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
            <slot />
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Built with wouter-vue • <a href="https://github.com/s00d/wouter-vue" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">GitHub</a></p>
        </div>
      </div>
    </footer>

    <!-- Search Modal -->
    <SearchModal :is-open="searchOpen" @close="searchOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, nextTick, createApp, watch } from 'vue';
import { Link, useLocation } from 'wouter-vue';
import Sidebar from './Sidebar.vue';
import SearchModal from './SearchModal.vue';
import CopyButton from './CopyButton.vue';
import CodeBlock from './CodeBlock.vue';
import ThemeToggle from './ThemeToggle.vue';

const sidebarOpen = ref(false);
const searchOpen = ref(false);
const copyButtonInstances = [];
const codeBlockInstances = [];
let observer = null;

// Reset scroll position on navigation
const [location] = useLocation();
watch(location, () => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
});

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

function setupCodeBlocks() {
  // Mount CodeBlock components for special mount points
  document.querySelectorAll('.code-block-mount').forEach(mountPoint => {
    // Skip if already processed
    if (mountPoint.dataset.mounted === 'true') return;
    mountPoint.dataset.mounted = 'true';
    
    const code = mountPoint.dataset.code
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const lang = mountPoint.dataset.lang || '';
    
    // Mount CodeBlock component
    const app = createApp(CodeBlock, { code, lang });
    app.mount(mountPoint);
    codeBlockInstances.push(app);
  });
  
  // Fallback: Find legacy code blocks and add copy buttons
  // This handles code blocks that weren't processed by the new system
  const selectors = ['.prose pre', 'pre.hljs', 'pre'];
  const processedPre = new Set();
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(pre => {
      // Skip if inside a code-block-mount (already handled)
      if (pre.closest('.code-block-mount')) return;
      
      // Skip if already processed or button already exists
      if (processedPre.has(pre) || pre.querySelector('.copy-button-container')) return;
      processedPre.add(pre);

      // Get code content
      const code = pre.querySelector('code');
      if (!code) return;

      const codeText = code.innerText || code.textContent || '';
      if (!codeText.trim()) return;

      // Ensure pre has relative positioning
      if (getComputedStyle(pre).position === 'static') {
        pre.style.position = 'relative';
      }

      // Create container for button
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'copy-button-container';
      pre.appendChild(buttonContainer);

      // Mount Vue component
      const app = createApp(CopyButton, { code: codeText });
      app.mount(buttonContainer);
      copyButtonInstances.push(app);
    });
  });
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  
  // Initial setup with delay to ensure DOM is ready
  setTimeout(() => {
    setupCodeBlocks();
  }, 100);
  
  // Use MutationObserver to watch for new code blocks
  observer = new MutationObserver(() => {
    setupCodeBlocks();
  });
  
  // Observe changes in the main content area
  const mainContent = document.querySelector('main');
  if (mainContent) {
    observer.observe(mainContent, {
      childList: true,
      subtree: true
    });
  }
});

onUpdated(() => {
  nextTick(() => {
    setTimeout(() => {
      setupCodeBlocks();
    }, 100);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  copyButtonInstances.forEach(app => app.unmount());
  copyButtonInstances.length = 0;
  codeBlockInstances.forEach(app => app.unmount());
  codeBlockInstances.length = 0;
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>

