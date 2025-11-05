---
title: Hierarchical Data Passing
description: Pass reactive data through routing hierarchy
---

# Hierarchical Data Passing

wouter-vue provides a powerful mechanism for passing reactive data hierarchically through your routing tree.

## The Problem

How do you pass common data (theme, layout, permissions) to a group of pages without prop drilling?

## The Solution

Use the `data` prop on `<Switch>`, `<AnimatedSwitch>`, and `<Route>` components to pass data down the routing tree.

## Basic Usage

**Pass data from Switch:**

```vue
<template>
  <Switch :data="{ theme: 'dark', layout: 'default' }">
    <Route path="/" :component="HomePage" />
    <Route path="/about" :component="AboutPage" />
    <!-- Both pages receive { theme: 'dark', layout: 'default' } -->
  </Switch>
</template>
```

**Override data in Route:**

```vue
<template>
  <Switch :data="{ theme: 'dark', layout: 'default' }">
    <Route path="/about" :component="AboutPage" :data="{ layout: 'sidebar' }" />
    <!-- AboutPage receives: { theme: 'dark', layout: 'sidebar' } -->
  </Switch>
</template>
```

## Reactive Data Flow

Data is fully reactive. Changes in parent routes automatically propagate to child components:

```vue
<script setup>
import { ref } from 'vue';
import { Switch, Route } from 'wouter-vue';

const globalData = ref({ theme: 'light', user: null });

function login() {
  globalData.value.user = { name: 'Alice' };
}
</script>

<template>
  <button @click="login">Login</button>
  
  <Switch :data="globalData">
    <Route path="/" :component="HomePage" />
  </Switch>
</template>
```

When `login()` is called, all child components automatically receive updated data.

## Accessing Data

### Via Props (for `:component`)

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

### Via `useRouteData()` Composable

```vue
<script setup>
import { useRouteData } from 'wouter-vue';

const routeData = useRouteData();

// Access data reactively
const theme = computed(() => routeData.value.theme);
const layout = computed(() => routeData.value.layout);

// Watch for changes
watch(routeData, (newData) => {
  console.log('Route data changed:', newData);
}, { deep: true });
</script>
```

## Data Merging Behavior

Data is merged hierarchically with child properties overriding parent properties:

- Data from `<Switch>` or `<AnimatedSwitch>` becomes the base for all child routes
- Data from `<Route>` merges with parent data, with child properties taking precedence
- Merging is shallow - child properties completely replace parent properties with the same key

```vue
<template>
  <Switch :data="{ theme: 'dark', layout: 'default', debug: false }">
    <!-- Result: { theme: 'dark', layout: 'sidebar', debug: false, pageName: 'Home' } -->
    <!-- 'layout' is overridden, 'debug' is inherited -->
    <Route path="/" :component="HomePage" :data="{ layout: 'sidebar', pageName: 'Home' }" />
  </Switch>
</template>
```

## Nested Routes

Data inheritance works seamlessly with nested routes:

```vue
<template>
  <Switch :data="{ theme: 'dark' }">
    <Route path="/users/:id" nest :data="{ userContext: true }">
      <!-- Child routes inherit both theme and userContext -->
      <Route path="/profile" :component="ProfilePage" :data="{ pageName: 'Profile' }" />
      <!-- ProfilePage receives: { theme: 'dark', userContext: true, pageName: 'Profile' } -->
    </Route>
  </Switch>
</template>
```

## Performance Considerations

- Data merging is efficient - uses Vue's `computed` for automatic reactivity
- No performance impact for routes without data
- Shallow merging keeps overhead minimal

## Use Cases

- **Theme management** - Pass theme to all pages
- **Layout configuration** - Different layouts per route
- **Permissions** - User permissions inherited by nested routes
- **Page metadata** - Titles, descriptions, breadcrumbs
- **Feature flags** - Enable/disable features per route

See [Dynamic Page Titles](/cookbook/dynamic-page-titles) for a practical example.


