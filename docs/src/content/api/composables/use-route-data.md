---
title: useRouteData
description: Access hierarchical route data passed from parent routes
section: API Reference
order: 34
---

# useRouteData

Access hierarchical route data passed from parent routes.

## Description

Returns a reactive `Ref<RouteData>` containing all route data merged hierarchically from parent `<Switch>` and `<Route>` components.

## Returns

```typescript
Ref<RouteData>
```

Where `RouteData` is:
```typescript
Record<string, any>
```

## Data Merging Behavior

Route data is merged hierarchically with child data overriding parent data:

```vue
<!-- Parent Switch -->
<Switch :data="{ theme: 'dark', layout: 'default' }">
  <!-- Child Route -->
  <Route path="/about" :data="{ layout: 'sidebar' }" :component="AboutPage" />
</Switch>

<!-- AboutPage receives: { theme: 'dark', layout: 'sidebar' } -->
```

## Example

```vue
<script setup>
import { useRouteData } from 'wouter-vue';

const routeData = useRouteData();

// Access merged data
console.log(routeData.value.theme); // 'dark'
console.log(routeData.value.layout); // 'sidebar'
</script>

<template>
  <div :class="`theme-${routeData.theme}`">
    Layout: {{ routeData.layout }}
  </div>
</template>
```

## Access via Props

Route data is also available as props when using `:component` prop:

```vue
<!-- Route definition -->
<Route path="/about" :component="AboutPage" :data="{ title: 'About' }" />

<!-- AboutPage.vue -->
<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

console.log(props.data.title); // 'About'
</script>
```

## Reactive Updates

Route data is fully reactive. Changes in parent routes automatically propagate to child components:

```vue
<script setup>
import { ref } from 'vue';
import { Switch, Route } from 'wouter-vue';

const globalData = ref({ theme: 'light' });

function toggleTheme() {
  globalData.value.theme = globalData.value.theme === 'light' ? 'dark' : 'light';
}
</script>

<template>
  <Switch :data="globalData">
    <Route path="/about" :component="AboutPage" />
  </Switch>
</template>
```

See [Hierarchical Data Passing](/guides/hierarchical-data) for detailed information.


