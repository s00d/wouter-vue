---
title: useParams
description: Get route parameters from the current route
section: API Reference
order: 32
---

# useParams

Get route parameters from the current route.

## Description

Returns a reactive `Ref<RouteParams>` containing all route parameters extracted from the current location. Parameters are automatically merged from parent routes when using nested routing.

## Returns

```typescript
Ref<RouteParams>
```

Where `RouteParams` is:
```typescript
Record<string, string>
```

## Important Note

**`useParams()` always returns a reactive `Ref`**. Even if no route parameters are present, it returns `ref({})`, ensuring consistent reactivity behavior.

## Example

```vue
<script setup>
import { useParams } from 'wouter-vue';

const params = useParams();

// For route '/users/:id' and location '/users/123':
// params.value === { id: '123' }

// For route '/' (no params):
// params.value === {}
</script>

<template>
  <div v-if="params.id">
    User ID: {{ params.value.id }}
  </div>
</template>
```

## Nested Routes

When using nested routes, parameters are automatically merged:

```vue
<!-- Parent route: /users/:userId -->
<!-- Child route: /posts/:postId -->
<!-- Current location: /users/123/posts/456 -->

<!-- In child component: -->
<script setup>
import { useParams } from 'wouter-vue';

const params = useParams();
// params.value === { userId: '123', postId: '456' }
</script>
```

## Access via Props

Route parameters are also available as props when using `:component` prop:

```vue
<!-- Route definition -->
<Route path="/users/:id" :component="UserPage" />

<!-- UserPage.vue -->
<script setup>
const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  }
});

console.log(props.params.id); // '123'
</script>
```

