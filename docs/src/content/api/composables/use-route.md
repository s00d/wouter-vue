---
title: useRoute
description: Check if current location matches a route pattern
---

# useRoute

Check if the current location matches a route pattern.

## Description

Returns a tuple `[matches, params]` where:
- `matches` is a reactive `Ref<boolean>` indicating if the route matches
- `params` is a reactive `Ref<RouteParams>` containing extracted route parameters

## Parameters

- `pattern: string | RegExp` - Route pattern to match against

## Returns

```typescript
[Ref<boolean>, Ref<RouteParams>]
```

## Example

```vue
<script setup>
import { useRoute } from 'wouter-vue';

const [matches, params] = useRoute('/users/:id');

// If current location is '/users/123':
// matches.value === true
// params.value === { id: '123' }
</script>

<template>
  <div v-if="matches">
    User ID: {{ params.value.id }}
  </div>
</template>
```

## Notes

- The pattern matching uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- Supports all standard route patterns (named params, constraints, wildcards, etc.)
- See [Route Pattern Matching](/guides/route-patterns) for detailed pattern examples

