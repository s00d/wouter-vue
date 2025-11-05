---
title: useRouter
description: Get router instance for advanced operations
---

# useRouter

Get the router instance for advanced operations.

## Description

Returns the router instance, which provides access to advanced routing operations like custom location hooks, programmatic navigation, and router configuration.

## Returns

```typescript
RouterInstance
```

## Example

```vue
<script setup>
import { useRouter } from 'wouter-vue';

const router = useRouter();

// Access router methods
router.navigate('/about');
router.subscribe((location) => {
  console.log('Location changed:', location);
});
</script>
```

## Advanced Usage

Most use cases are covered by other composables like `useLocation()` and `useParams()`. Use `useRouter()` when you need:

- Custom location hooks
- Direct access to router internals
- Advanced subscription patterns

## See Also

- [useLocation](/api/composables/use-location) - For basic navigation
- [Custom Location Hooks](/guides/custom-location-hooks) - For custom routing behavior


