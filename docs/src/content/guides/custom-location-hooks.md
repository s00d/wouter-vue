---
title: Custom Location Hooks
description: Use hash-based routing or memory location for testing
---

# Custom Location Hooks

wouter-vue supports custom location hooks for different routing behaviors.

## Hash-based Routing

Use hash-based routing (e.g., `#/about`) instead of browser history:

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
    <Route path="/about">
      <AboutPage />
    </Route>
  </Router>
</template>
```

**Example URLs:**
- `http://example.com/#/about`
- `http://example.com/#/users/123`

## Memory Location (Testing)

Use memory location for testing - routes don't affect browser history:

```vue
<script setup>
import { Router } from 'wouter-vue';
import { useMemoryLocation } from 'wouter-vue/memory-location';

const memoryLocation = useMemoryLocation();
</script>

<template>
  <Router :location="memoryLocation">
    <Route path="/">
      <HomePage />
    </Route>
  </Router>
</template>
```

**Use cases:**
- Unit testing
- Component testing
- Storybook stories
- Isolated routing scenarios

## Creating Custom Hooks

You can create custom location hooks by implementing the `LocationHook` interface:

```typescript
interface LocationHook {
  (): [Ref<string>, (to: string, options?: NavigateOptions) => void];
}
```

**Example:**

```typescript
function useCustomLocation() {
  const location = ref('/');
  
  const navigate = (to: string, options?: NavigateOptions) => {
    // Custom navigation logic
    location.value = to;
  };
  
  return [location, navigate];
}
```

## Notes

- Default location hook is `useBrowserLocation()` (browser history API)
- Hash location is useful for static hosting without server configuration
- Memory location is perfect for testing environments


