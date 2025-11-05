<template>
  <li>
    <!-- Level 0: Section Header -->
    <template v-if="level === 0 && !item.isFile">
      <button
        @click="toggleCollapse"
        class="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 first:mt-0 hover:text-gray-700 transition-colors group"
      >
        <span>{{ item.title }}</span>
        <svg
          class="w-4 h-4 transition-transform duration-300 ease-in-out"
          :class="{ 'rotate-180': !isCollapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Transition
        name="slide"
        :duration="{ enter: 300, leave: 200 }"
      >
        <ul v-if="item.children.length > 0 && !isCollapsed" class="space-y-1">
          <MenuItem
            v-for="child in item.children"
            :key="child.path"
            :item="child"
            :level="level + 1"
          />
        </ul>
      </Transition>
    </template>

    <!-- Level 1: Subsection -->
    <template v-else-if="level === 1">
      <div v-if="item.children.length > 0">
        <button
          @click="toggleCollapse"
          class="w-full flex items-center justify-between px-3 py-1 text-xs font-medium text-gray-400 mb-1 hover:text-gray-600 transition-colors group"
        >
          <span>{{ item.title }}</span>
          <svg
            class="w-3 h-3 transition-transform duration-300 ease-in-out"
            :class="{ 'rotate-180': !isCollapsed }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition
          name="slide"
          :duration="{ enter: 300, leave: 200 }"
        >
          <ul v-if="!isCollapsed" class="space-y-1 mt-1">
            <MenuItem
              v-for="child in item.children"
              :key="child.path"
              :item="child"
              :level="level + 1"
            />
          </ul>
        </Transition>
      </div>
      <Link
        v-else
        :href="item.path"
        class="block px-3 py-2 rounded-md text-sm transition-colors duration-150"
        :class="isActive(item.path).value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'"
      >
        {{ item.title }}
      </Link>
    </template>

    <!-- Level 2: Leaf item -->
    <template v-else-if="level === 2">
      <Link
        :href="item.path"
        class="block px-3 py-2 rounded-md text-sm pl-6 transition-colors duration-150"
        :class="isActive(item.path).value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'"
      >
        {{ item.title }}
      </Link>
    </template>

    <!-- Level 3: Deep nested (if needed) -->
    <template v-else>
      <div v-if="item.children.length > 0" class="ml-2">
        <button
          @click="toggleCollapse"
          class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm pl-6 transition-colors hover:bg-gray-50 group"
        >
          <span>{{ item.title }}</span>
          <svg
            class="w-3 h-3 transition-transform duration-300 ease-in-out"
            :class="{ 'rotate-180': !isCollapsed }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition
          name="slide"
          :duration="{ enter: 300, leave: 200 }"
        >
          <ul v-if="!isCollapsed" class="space-y-1 mt-1 ml-2">
            <MenuItem
              v-for="child in item.children"
              :key="child.path"
              :item="child"
              :level="level + 1"
            />
          </ul>
        </Transition>
      </div>
      <Link
        v-else
        :href="item.path"
        class="block px-3 py-2 rounded-md text-sm pl-8 transition-colors duration-150"
        :class="isActive(item.path).value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'"
      >
        {{ item.title }}
      </Link>
    </template>
  </li>
</template>

<script setup>
import { computed, ref, watch, Transition } from 'vue';
import { Link, useLocation } from 'wouter-vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const [location] = useLocation();

// Check if any child is active
const hasActiveChild = computed(() => {
  if (!props.item.children || props.item.children.length === 0) {
    return false;
  }
  
  const currentPath = location.value || '/';
  
  const checkChildren = (children) => {
    for (const child of children) {
      if (child.path === currentPath || currentPath.startsWith(child.path + '/')) {
        return true;
      }
      if (child.children && child.children.length > 0) {
        if (checkChildren(child.children)) {
          return true;
        }
      }
    }
    return false;
  };
  
  return checkChildren(props.item.children);
});

// Track if user manually toggled the group (null = auto, true = collapsed, false = expanded)
const manualState = ref(null);

// By default, groups are expanded, but collapse if they don't have active children
const isCollapsed = computed(() => {
  // If user manually set state, use it
  if (manualState.value !== null) {
    return manualState.value;
  }
  // If has active child, always expand
  if (hasActiveChild.value) {
    return false;
  }
  // By default, expand level 0 (main sections), collapse others
  return props.level > 0;
});

// Auto-expand if has active child and user hasn't manually collapsed
watch(
  () => hasActiveChild.value,
  (isActive) => {
    if (isActive && manualState.value === true) {
      // Reset manual collapse if active child appears
      manualState.value = null;
    }
  },
  { immediate: true }
);

const toggleCollapse = () => {
  // Toggle: if currently collapsed, expand; if expanded, collapse
  if (manualState.value === null) {
    // First manual toggle: determine current state without reading isCollapsed
    const shouldBeCollapsed = hasActiveChild.value ? false : props.level > 0;
    manualState.value = !shouldBeCollapsed;
  } else {
    // Already manually set: just toggle
    manualState.value = !manualState.value;
  }
};

// Reactive function to check if path is active
const isActive = (path) => {
  return computed(() => {
    const currentPath = location.value || '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  });
};
</script>

<style scoped>
/* Slide animation for menu items */
.slide-enter-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-leave-active {
  transition: all 0.2s ease-in;
  overflow: hidden;
}

.slide-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-enter-to {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.slide-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>


