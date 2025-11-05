---
title: Wouter for Vue 3
description: A minimal, high-performance router for Vue 3
---

<div class="text-center mb-12">

# Wouter for Vue 3

**wouter-vue** is a minimal, high-performance router for Vue 3 (~7.9KB gzipped, 17.5KB uncompressed) that relies on Composition API and provides an intuitive routing experience.

</div>

## Features

- **📦 Minimal bundle size** (~7.9KB gzipped, 17.5KB uncompressed) - 72% smaller response size vs vue-router
- **⚡ Outstanding performance** - 72% higher throughput, handles 83% more requests
- **🎯 Vue 3 Composition API** - Fully reactive routing with TypeScript support
- **🔧 Optional `<Router />`** - No top-level router required, works out of the box
- **📦 Minimal dependencies** (Vue 3 + path-to-regexp)
- **🎨 Server-Side Rendering (SSR)** - Full SSR support with Vite
- **🗂️ Nested routing** - Flexible route parameters and nested structures
- **🔗 Active links** - Scoped slot API for active state styling
- **💾 TypeScript** - Full type definitions included
- **📊 Hierarchical & Reactive Data Passing** - Pass data down routing tree with automatic merging

## Performance

Based on load testing with Artillery.io (3,300 virtual users, 200 routes, 6-minute duration):

| Metric | wouter-vue | vue-router | Advantage |
|--------|-----------|------------|-----------|
| **Throughput** | 117 req/s | 68 req/s | **+72% faster** |
| **Total Requests** | 36,300 | 19,800 | **+83% more requests** |
| **Latency (mean)** | 0.9 ms | 0.6 ms | Comparable |
| **Latency (p50)** | 1 ms | 1 ms | Same performance |

**Key Takeaway:** wouter-vue processes **72% more requests per second** (117 vs 68 req/s) with **identical median latency** (1ms) compared to vue-router, while handling **nearly double the total requests** (36,300 vs 19,800) in the same timeframe, making it ideal for high-traffic applications.

## Quick Start

```vue
<template>
  <!-- Router is optional, but recommended for nested routes and SSR -->
  <Router>
    <Link href="/about">About</Link>
    
    <Route path="/">
      <HomePage />
    </Route>
    
    <Route path="/about">
      <AboutPage />
    </Route>
  </Router>
</template>

<script setup>
import { Router, Route, Link } from 'wouter-vue';
import HomePage from './pages/HomePage.vue';
import AboutPage from './pages/AboutPage.vue';
</script>
```

## Installation

```bash
npm install wouter-vue
# or
pnpm add wouter-vue
# or
yarn add wouter-vue
```

**Requirements:** Vue 3.5.22 or higher

## Next Steps

- [Getting Started](/getting-started) - Learn the basics
- [API Reference](/api/composables/use-location) - Explore all APIs
- [Guides](/guides/route-patterns) - Advanced patterns and techniques
- [Cookbook](/cookbook/route-guards) - Practical examples and recipes

## About

**wouter-vue** is inspired by the original [wouter](https://github.com/molefrog/wouter) router for React and Preact. The original wouter's minimalist philosophy, hook-based architecture, and elegant simplicity resonated strongly, leading to the creation of this Vue 3 adaptation.

This project attempts to bring the same core principles and design philosophy to Vue's ecosystem:
- **Minimalist approach** - Keep it tiny with minimal dependencies
- **Composition API first** - Leverage Vue's reactivity system instead of React hooks
- **Optional Router** - No mandatory top-level component
- **Familiar API** - Similar components and patterns for easy migration
- **Performance focused** - Small bundle size and efficient routing
- **Path-to-RegExp powered** - Uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for robust route matching with full pattern support
- **Hierarchical data passing** - Pass reactive data down routing tree with automatic merging


