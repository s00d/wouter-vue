---
title: Switch
description: Render only the first matching route for performance
---

# Switch

Render only the first matching route. Essential for performance optimization.

## Description

The `<Switch>` component checks routes sequentially and renders only the **first** matching route. This is crucial for performance when you have many routes, as it stops checking after the first match.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `string?` | `undefined` | Override location for routing (optional) |
| `data` | `Object?` | `undefined` | Base data object to pass to child routes (reactive) |

## Usage

```vue
<template>
  <Switch :data="{ theme: 'dark', layout: 'default' }">
    <Route path="/">
      <HomePage />
    </Route>
    <Route path="/about">
      <AboutPage />
    </Route>
    <Route>
      <NotFoundPage />
    </Route>
  </Switch>
</template>
```

## Performance Best Practices

**✅ Good: Prioritize frequent routes**

```vue
<Switch>
  <Route path="/">Home</Route>           <!-- Most frequent -->
  <Route path="/dashboard">Dashboard</Route>
  <Route path="/about">About</Route>
  <Route>404</Route>                     <!-- Least frequent -->
</Switch>
```

**❌ Bad: Avoid large v-for loops**

```vue
<!-- DON'T DO THIS -->
<Switch>
  <Route v-for="item in bigList" :key="item.id" :path="`/items/${item.id}`" />
</Switch>
```

**✅ Good: Use dynamic parameters instead**

```vue
<Switch>
  <Route path="/items/:id" :component="ItemDispatcher" />
</Switch>
```

See [Performance & Best Practices](/performance) for detailed optimization strategies.

## Data Passing

Data passed to `<Switch>` is inherited by all child routes:

```vue
<template>
  <Switch :data="{ theme: 'dark' }">
    <Route path="/about" :data="{ layout: 'sidebar' }" :component="AboutPage" />
    <!-- AboutPage receives: { theme: 'dark', layout: 'sidebar' } -->
  </Switch>
</template>
```

See [Hierarchical Data Passing](/guides/hierarchical-data) for more details.


