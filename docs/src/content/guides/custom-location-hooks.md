---
title: Custom Location Hooks
description: Use hash-based routing or memory location for testing
section: Guides
order: 14
---

# Custom Location Hooks

wouter-vue supports custom location hooks for different routing behaviors.

## Hash-based Routing

Use hash-based routing (e.g., `#/about`) instead of browser history:

```vue
<script setup>
import { Router } from 'wouter-vue';
import { useHashLocation } from 'wouter-vue/use-hash-location';

// Wrap useHashLocation in a function that matches Router's hook signature
const hashLocationHook = (router) => {
  return useHashLocation({ ssrPath: router.ssrPath });
};
</script>

<template>
  <Router :hook="hashLocationHook">
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
<script>
import { memoryLocation } from 'wouter-vue/memory-location';

// Create memory location instance
const memLoc = memoryLocation({ record: true });

// Call hook() once to get the location tuple
const locationTuple = memLoc.hook();

// Factory function that always returns the same tuple
const locationHook = () => locationTuple;
</script>

<script setup>
import { Router } from 'wouter-vue';
</script>

<template>
  <Router :hook="locationHook">
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
- **Important**: Router component uses `:hook` prop, not `:location`
- Custom hooks must be functions that accept a `RouterObject` and return `[Ref<Path>, NavigateFn]`
- For `memoryLocation`, call `hook()` once and reuse the result to ensure all components share the same reactive state


