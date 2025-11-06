---
title: useLocation
description: Get current location and navigate programmatically
section: API Reference
order: 31
---

# useLocation

Get the current location and navigate programmatically.

## Description

Returns a tuple `[location, navigate]` where:
- `location` is a reactive `Ref<string>` containing the current pathname
- `navigate` is a function to programmatically change the location

## Returns

```typescript
[Ref<string>, (to: string, options?: NavigateOptions) => void]
```

## Example

```vue
<script setup>
import { useLocation } from 'wouter-vue';

const [location, navigate] = useLocation();

function goToAbout() {
  navigate('/about');
}
</script>

<template>
  <div>
    <p>Current location: {{ location }}</p>
    <button @click="goToAbout">Go to About</button>
  </div>
</template>
```

## Navigate Options

The `navigate` function accepts an optional second parameter:

```typescript
navigate('/about', { replace: true });
```

- `replace: boolean` - If `true`, replaces current history entry instead of adding a new one (default: `false`)


