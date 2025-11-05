---
title: Performance & Best Practices
description: Optimize routing performance
---

# Performance & Best Practices

wouter-vue is designed for maximum performance. Follow these best practices.

## Route Prioritization

Always place most frequent routes first in `<Switch>`:

```vue
<Switch>
  <Route path="/">Home</Route>           <!-- Most frequent -->
  <Route path="/dashboard">Dashboard</Route>
  <Route path="/about">About</Route>
  <Route>404</Route>                     <!-- Least frequent -->
</Switch>
```

## Avoid Large v-for Loops

**❌ Don't:**

```vue
<Switch>
  <Route v-for="item in bigList" :key="item.id" :path="`/items/${item.id}`" />
</Switch>
```

**✅ Do:**

```vue
<Switch>
  <Route path="/items/:id" :component="ItemDispatcher" />
</Switch>
```

Use dynamic parameters instead of many routes.

## Use Dispatcher Pattern

Create a dispatcher component for dynamic routes:

```vue
<!-- ItemDispatcher.vue -->
<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useParams } from 'wouter-vue';

const params = useParams();
const activeComponent = computed(() => {
  const itemId = params.value.id;
  return defineAsyncComponent(() => import(`./pages/items/ItemPage${itemId}.vue`));
});
</script>

<template>
  <component :is="activeComponent" />
</template>
```

This reduces `<Switch>` checks from N to 1.

## Performance Comparison

Based on load testing (3,300 users, 200 routes):

| Metric | wouter-vue | vue-router |
|--------|-----------|------------|
| **Throughput** | 117 req/s | 68 req/s |
| **Total Requests** | 36,300 | 19,800 |
| **Latency (p50)** | 1 ms | 1 ms |

wouter-vue handles **72% more requests per second** with identical latency.

## Notes

- Prioritize routes by frequency
- Use dynamic parameters instead of loops
- See [Switch documentation](/api/components/switch) for details


