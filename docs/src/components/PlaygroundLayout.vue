<template>
  <div class="playground-layout h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-800">
    <!-- Minimal header for Playground -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 z-50">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center">
            <Link href="/" class="text-xl font-bold text-gray-900 dark:text-gray-100">
              wouter-vue
            </Link>
            <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Playground</span>
          </div>
          <div class="flex items-center space-x-4">
            <Link href="/" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              ← Back to Docs
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Playground content -->
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { Link } from 'wouter-vue';
import ThemeToggle from '../components/ThemeToggle.vue';
</script>

<style scoped>
.playground-layout {
  /* Стили для layout */
}
</style>

