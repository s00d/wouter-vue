---
title: Route
description: Match and render components based on URL patterns
section: API Reference
order: 41
---

# Route

Match and render components based on URL patterns.

## Description

The `<Route>` component matches the current location against a pattern and renders its content when matched. It supports both slot-based and component-based rendering.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `string \| RegExp?` | `undefined` | Route pattern to match (optional for catch-all) |
| `component` | `Component?` | `undefined` | Vue component to render when matched |
| `nest` | `boolean?` | `false` | Enable nested routing |
| `data` | `Object?` | `undefined` | Data object to pass to component/slot (reactive) |

## Usage

**Slot-based rendering:**

```vue
<template>
  <Route path="/about">
    <AboutPage />
  </Route>
</template>
```

**Component prop:**

```vue
<template>
  <Route path="/about" :component="AboutPage" />
</template>

<script setup>
import AboutPage from './pages/AboutPage.vue';
</script>
```

**With route data:**

```vue
<template>
  <Route path="/about" :component="AboutPage" :data="{ title: 'About' }" />
</template>
```

**Accessing params and data in slots:**

```vue
<template>
  <Route path="/users/:id">
    <template #default="{ params, data }">
      <div>
        User ID: {{ params.value.id }}
        Theme: {{ data.theme }}
      </div>
    </template>
  </Route>
</template>
```

**Nested routes:**

```vue
<template>
  <Route path="/users/:userId" nest>
    <h1>User {{ params.value.userId }}</h1>
    <Route path="/profile">
      <UserProfile />
    </Route>
    <Route path="/settings">
      <UserSettings />
    </Route>
  </Route>
</template>
```

**Catch-all route (404):**

```vue
<template>
  <Route>
    <NotFoundPage />
  </Route>
</template>
```

## Accessing Props in Components

When using `:component`, the component receives `params` and `data` as props:

```vue
<!-- Route definition -->
<Route path="/users/:id" :component="UserPage" :data="{ title: 'User' }" />

<!-- UserPage.vue -->
<script setup>
const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

console.log(props.params.id); // '123'
console.log(props.data.title); // 'User'
</script>
```

## Notes

- Route patterns use [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- See [Route Pattern Matching](/guides/route-patterns) for pattern examples
- See [Hierarchical Data Passing](/guides/hierarchical-data) for data prop details
- See [Nested Routing](/guides/nested-routing) for nested routing examples

