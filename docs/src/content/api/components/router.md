---
title: Router
description: Optional router component for nested routes and SSR
---

# Router

Optional router component that provides routing context for nested routes and SSR support.

## Description

The `<Router>` component is **optional** - wouter-vue works without it for simple cases. However, it's recommended for:
- Nested routing
- Server-Side Rendering (SSR)
- Custom location hooks
- Advanced routing scenarios

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `LocationHook?` | `undefined` | Custom location hook (optional) |
| `ssrPath` | `string?` | `undefined` | Initial path for SSR (optional) |
| `ssrSearch` | `string?` | `undefined` | Initial search string for SSR (optional) |

## Usage

**Basic usage:**

```vue
<template>
  <Router>
    <Route path="/">
      <HomePage />
    </Route>
    <Route path="/about">
      <AboutPage />
    </Route>
  </Router>
</template>
```

**With SSR:**

```vue
<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch">
    <AppRoutes />
  </Router>
</template>

<script setup>
const props = defineProps({
  ssrPath: String,
  ssrSearch: String
});
</script>
```

**With custom location hook:**

```vue
<script setup>
import { Router } from 'wouter-vue';
import { useHashLocation } from 'wouter-vue/use-hash-location';

const hashLocation = useHashLocation();
</script>

<template>
  <Router :location="hashLocation">
    <Route path="/">
      <HomePage />
    </Route>
  </Router>
</template>
```

## Notes

- Without `<Router>`, routes still work but nested routing may not function correctly
- For SSR, always wrap your app with `<Router>` and pass `ssrPath` and `ssrSearch` props
- See [Custom Location Hooks](/guides/custom-location-hooks) for more information


