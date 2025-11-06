---
title: Core Concepts
description: Understanding wouter-vue's fundamental concepts
section: Introduction
order: 3
---

# Core Concepts

## Composition API First

wouter-vue uses a **composition-based** routing approach that leverages Vue 3's Composition API:

- No global router instance required
- Each component can access routing through composables
- `<Router />` component is **optional** - provides context for nested routes and custom configuration
- Uses Vue's reactivity system for automatic updates

All routing functionality is available through composables that work seamlessly with Vue 3's Composition API:

```vue
<script setup>
import { useLocation, useRoute } from 'wouter-vue';

const [location, navigate] = useLocation();
const [matches, params] = useRoute('/users/:id');
</script>
```

## Reactive Data Flow

wouter-vue provides fully reactive routing with two main data flows:

**Route Parameters (`useParams`)**
- Route parameters extracted from URL patterns (e.g., `/users/:id` → `{ id: '123' }`)
- Automatically merged from parent routes when using nested routing
- Always returns a reactive `Ref<RouteParams>` that updates when route changes

**Route Data (`useRouteData` / `data` prop)**
- Arbitrary data passed hierarchically through `<Switch>` → `<Route>` → component
- Automatically merged with child data overriding parent data
- Fully reactive - changes propagate automatically through the routing tree
- Accessible via props (for `:component`) or `useRouteData()` composable

```vue
<script setup>
import { useParams, useRouteData } from 'wouter-vue';

// Route parameters from URL
const params = useParams();
console.log(params.value.userId); // '123'

// Route data from parent routes
const routeData = useRouteData();
console.log(routeData.value.theme); // 'dark'
</script>
```

See [Hierarchical Data Passing](/guides/hierarchical-data) for detailed information on passing reactive data through routes.


