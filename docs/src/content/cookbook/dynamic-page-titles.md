---
title: Dynamic Page Titles
description: Update document.title using route data
---

# Dynamic Page Titles

Update `document.title` dynamically based on route data.

## Using Route Data

Define titles in route data:

```vue
<!-- AppRoutes.vue -->
<template>
  <Switch>
    <Route path="/" :component="HomePage" :data="{ title: 'Home' }" />
    <Route path="/about" :component="AboutPage" :data="{ title: 'About Us' }" />
    <Route path="/contact" :component="ContactPage" :data="{ title: 'Contact' }" />
  </Switch>
</template>
```

## Watch Route Data

In `App.vue`, watch `useRouteData()` to update `document.title`:

```vue
<script setup>
import { watch } from 'vue';
import { useRouteData } from 'wouter-vue';

const routeData = useRouteData();

watch(
  () => routeData.value?.title,
  (newTitle) => {
    if (newTitle) {
      document.title = `${newTitle} - My App`;
    } else {
      document.title = 'My App';
    }
  },
  { immediate: true }
);
</script>
```

## With Dynamic Parameters

Combine route data with parameters:

```vue
<!-- Route definition -->
<Route path="/users/:id" :component="UserPage" :data="{ titlePrefix: 'User' }" />

<!-- UserPage.vue -->
<script setup>
import { watch } from 'vue';
import { useParams, useRouteData } from 'wouter-vue';

const params = useParams();
const routeData = useRouteData();

watch(
  [() => routeData.value?.titlePrefix, () => params.value.id],
  ([prefix, id]) => {
    if (prefix && id) {
      document.title = `${prefix} ${id} - My App`;
    }
  },
  { immediate: true }
);
</script>
```

## Notes

- Use `watch` with `immediate: true` for initial title update
- Combine route data and parameters for dynamic titles
- See [Hierarchical Data Passing](/guides/hierarchical-data) for more details


