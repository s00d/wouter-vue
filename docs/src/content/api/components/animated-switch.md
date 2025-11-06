---
title: AnimatedSwitch
description: Switch component with animated route transitions
section: API Reference
order: 43
---

# AnimatedSwitch

Wraps `<Switch>` with Vue `<Transition>` for animated route transitions.

## Description

`<AnimatedSwitch>` automatically triggers animations when routes change, providing smooth transitions between pages.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string?` | `'fade'` | Transition name for CSS classes |
| `mode` | `'out-in' \| 'in-out' \| 'default'?` | `'out-in'` | Transition mode |
| `location` | `string?` | `undefined` | Override location for routing (optional) |
| `data` | `Object?` | `undefined` | Base data object to pass to child routes (reactive) |

## Usage

**Basic fade transition:**

```vue
<template>
  <Router>
    <AnimatedSwitch name="fade" mode="out-in">
      <Route path="/home" :component="HomePage" />
      <Route path="/about" :component="AboutPage" />
      <Route :component="NotFoundPage" />
    </AnimatedSwitch>
  </Router>
</template>

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

**Slide transition:**

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

**With route data:**

```vue
<template>
  <AnimatedSwitch name="fade" :data="{ theme: 'dark' }">
    <Route path="/about" :component="AboutPage" />
  </AnimatedSwitch>
</template>
```

## Transition Modes

- `'out-in'` (default): Current route exits first, then new route enters
- `'in-out'`: New route enters first, then current route exits
- `'default'`: Both routes transition simultaneously

## Notes

- Uses Vue's `<Transition>` component under the hood
- See [Animated Route Transitions](/cookbook/animated-transitions) for more examples
- See [Hierarchical Data Passing](/guides/hierarchical-data) for data prop details


