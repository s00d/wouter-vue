---
title: Troubleshooting
description: Common issues and solutions
section: Other
order: 85
---

# Troubleshooting

Common issues and their solutions.

## Routes Not Matching

**Problem:** Routes don't match even though the URL looks correct.

**Solution:** Check route pattern syntax:
- Use `:param` for named parameters
- Use `/*param` for wildcards
- Ensure `<Switch>` wraps routes correctly

## Nested Routes Not Working

**Problem:** Child routes don't match in nested structures.

**Solution:** Ensure `nest` prop is set:
```vue
<Route path="/users/:id" nest>
  <Route path="/profile">...</Route>
</Route>
```

## SSR Issues

**Problem:** Routes don't work on server.

**Solution:** Always wrap with `<Router>` and pass `ssrPath`:
```vue
<Router :ssr-path="ssrPath">
  <Route path="/">...</Route>
</Router>
```

## Data Not Reactive

**Problem:** Route data doesn't update when parent changes.

**Solution:** Ensure you're using `ref()` or `computed()`:
```vue
<Switch :data="ref({ theme: 'dark' })">
  <!-- Not: :data="{ theme: 'dark' }" -->
</Switch>
```

## Query Parameters Not Working

**Problem:** Query parameters are empty on client-side hydration.

**Solution:** This is fixed in latest version. Ensure you're using `useSearchParams()` correctly:
```vue
<script setup>
import { useSearchParams } from 'wouter-vue';
const [searchParams] = useSearchParams();
</script>
```

## Need Help?

- Check [API Reference](/api/composables/use-location)
- See [Examples](../../examples/example/)
- Open an issue on GitHub


