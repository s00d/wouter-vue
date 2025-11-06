---
title: Route Guards
description: Protect routes with authentication and authorization
section: Cookbook
order: 64
---

# Route Guards

Implement route protection using Vue's reactivity system and watchers.

## Global Route Guard

Watch location changes and redirect based on authentication:

```vue
<script setup>
import { useLocation, Redirect } from 'wouter-vue';

const [location, navigate] = useLocation();
const isAuthenticated = ref(false);

// Global authentication check on route change
watch(() => location.value, (newPath) => {
  if (newPath.startsWith('/admin') && !isAuthenticated.value) {
    navigate('/login');
  }
});

function handleLogin() {
  isAuthenticated.value = true;
  navigate('/admin');
}
</script>
```

## Protected Route Component

Create a reusable wrapper component:

```vue
<template>
  <Route path="/admin">
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  </Route>
</template>
```

**ProtectedRoute.vue:**

```vue
<script setup>
import { Redirect } from 'wouter-vue';
import { h } from 'vue';

const props = defineProps({
  requiredRole: String
});

const isAuthenticated = computed(() => {
  // Your authentication logic
  return true; // or false
});

const hasPermission = computed(() => {
  // Your authorization logic
  return true; // or false
});
</script>

<template>
  <component :is="isAuthenticated && hasPermission ? undefined : Redirect" :to="'/login'" />
  <slot v-if="isAuthenticated && hasPermission" />
</template>
```

## Alternative with Conditional Rendering

```vue
<template>
  <Route path="/admin">
    <template #default="{ params, data }">
      <ProtectedRoute v-if="isAuthenticated" :required-role="'admin'">
        <AdminPage />
      </ProtectedRoute>
      <Redirect v-else to="/login" />
    </template>
  </Route>
</template>
```

## Notes

- Use `watch` to monitor location changes
- Use `Redirect` component for programmatic redirects
- Combine with `useRouteData()` for route-specific permissions
- See [Hierarchical Data Passing](/guides/hierarchical-data) for passing permissions through routes


