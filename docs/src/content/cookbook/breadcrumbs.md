---
title: Breadcrumbs
description: Create breadcrumb navigation using route data
section: Cookbook
order: 62
---

# Breadcrumbs

Create breadcrumb navigation using route parameters and data.

## Basic Breadcrumbs

```vue
<script setup>
import { useParams, useRouteData, useLocation } from 'wouter-vue';

const params = useParams();
const routeData = useRouteData();
const [location] = useLocation();

const breadcrumbs = computed(() => {
  const crumbs = [{ label: 'Home', path: '/' }];
  
  if (location.value.startsWith('/users')) {
    crumbs.push({ label: 'Users', path: '/users' });
    
    if (params.value.id) {
      crumbs.push({ 
        label: `User ${params.value.id}`, 
        path: `/users/${params.value.id}` 
      });
    }
  }
  
  return crumbs;
});
</script>

<template>
  <nav>
    <ol>
      <li v-for="crumb in breadcrumbs" :key="crumb.path">
        <Link :href="crumb.path">{{ crumb.label }}</Link>
      </li>
    </ol>
  </nav>
</template>
```

## Using Route Data

Pass breadcrumb information through route data:

```vue
<!-- Route definition -->
<Switch :data="{ breadcrumbs: [{ label: 'Home', path: '/' }] }">
  <Route path="/users/:id" :data="{ breadcrumbs: [{ label: 'Users', path: '/users' }] }">
    <UserPage />
  </Route>
</Switch>

<!-- UserPage.vue -->
<script setup>
import { useRouteData } from 'wouter-vue';

const routeData = useRouteData();
const breadcrumbs = computed(() => routeData.value.breadcrumbs || []);
</script>

<template>
  <nav>
    <ol>
      <li v-for="crumb in breadcrumbs" :key="crumb.path">
        <Link :href="crumb.path">{{ crumb.label }}</Link>
      </li>
    </ol>
  </nav>
</template>
```

## Notes

- Combine route parameters and data for flexible breadcrumbs
- Use `useRouteData()` to access hierarchical breadcrumb data
- See [Hierarchical Data Passing](/guides/hierarchical-data) for more details


