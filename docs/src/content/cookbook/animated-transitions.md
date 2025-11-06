---
title: Animated Route Transitions
description: Add smooth transitions between routes
section: Cookbook
order: 61
---

# Animated Route Transitions

Add smooth animations when navigating between routes.

## Using AnimatedSwitch

The `AnimatedSwitch` component simplifies animated transitions:

```vue
<template>
  <Router>
    <Suspense>
      <AnimatedSwitch name="fade" mode="out-in">
        <Route path="/" :component="HomePage" />
        <Route path="/about" :component="AboutPage" />
        <Route path="/contact" :component="ContactPage" />
      </AnimatedSwitch>

      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </Router>
</template>

<script setup>
import { Router, Route, AnimatedSwitch } from 'wouter-vue';
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Transition Modes

- `'out-in'` (default) - Current route exits first, then new route enters
- `'in-out'` - New route enters first, then current route exits
- `'default'` - Both routes transition simultaneously

## Slide Transition

```vue
<template>
  <AnimatedSwitch name="slide" mode="out-in">
    <Route path="/home" :component="HomePage" />
    <Route path="/about" :component="AboutPage" />
  </AnimatedSwitch>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

## Manual Transition

For more control, wrap `Switch` manually:

```vue
<template>
  <Router>
    <Transition name="fade" mode="out-in">
      <Switch>
        <Route path="/" :component="HomePage" />
        <Route path="/about" :component="AboutPage" />
      </Switch>
    </Transition>
  </Router>
</template>
```

## Notes

- `AnimatedSwitch` uses Vue's `<Transition>` component
- CSS transition classes follow Vue's naming convention
- Use `mode="out-in"` to prevent layout shifts
- See [AnimatedSwitch API](/api/components/animated-switch) for details


