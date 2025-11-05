---
title: Migration Guide
description: Migrate from vue-router to wouter-vue
---

# Migration Guide

Guide for migrating from vue-router to wouter-vue.

## Key Differences

| vue-router | wouter-vue |
|------------|-----------|
| `useRouter()` | `useLocation()` |
| `useRoute()` | `useRoute(pattern)` |
| `$route.params` | `useParams()` |
| `<router-view>` | `<Route>` |
| `<router-link>` | `<Link>` |
| Route config array | Declarative `<Route>` components |

## Step-by-Step Migration

### 1. Install wouter-vue

```bash
npm install wouter-vue
```

### 2. Replace Router

**Before:**
```vue
<router-view />
```

**After:**
```vue
<Router>
  <Route path="/" :component="HomePage" />
</Router>
```

### 3. Replace Navigation

**Before:**
```vue
<router-link to="/about">About</router-link>
```

**After:**
```vue
<Link href="/about">About</Link>
```

### 4. Replace Route Matching

**Before:**
```vue
<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
if (route.path === '/users/:id') {
  // ...
}
</script>
```

**After:**
```vue
<script setup>
import { useRoute } from 'wouter-vue';
const [matches, params] = useRoute('/users/:id');
if (matches.value) {
  // Use params.value.id
}
</script>
```

## Common Patterns

See [API Reference](/api/composables/use-location) for full API documentation.


