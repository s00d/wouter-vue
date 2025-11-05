# Wouter for Vue 3

<div align="center">

[![npm version](https://img.shields.io/npm/v/wouter-vue/latest?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![npm downloads](https://img.shields.io/npm/dw/wouter-vue?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![License](https://img.shields.io/npm/l/wouter-vue?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![GitHub stars](https://img.shields.io/github/stars/s00d/wouter-vue?style=for-the-badge)](https://github.com/s00d/wouter-vue)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

  <b>wouter-vue</b> is a minimal, high-performance router for Vue 3 (~7.9KB gzipped, 17.5KB uncompressed) that relies on Composition API and provides an intuitive routing experience.
</div>

## 📚 Documentation

**Full documentation is available at: [https://s00d.github.io/wouter-vue/](https://s00d.github.io/wouter-vue/)**

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

While maintaining compatibility with Vue 3's Composition API and SSR requirements, wouter-vue preserves the elegant simplicity that made wouter popular in the React community, adapted for Vue developers who appreciate minimal, performant solutions. Route pattern matching is powered by [path-to-regexp](https://github.com/pillarjs/path-to-regexp), ensuring compatibility with industry-standard routing patterns and full support for advanced route matching features.

## 🚀 Features

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

## 📊 Performance

Based on load testing with Artillery.io (3,300 virtual users, 200 routes, 6-minute duration):

| Metric | wouter-vue | vue-router | Advantage |
|--------|-----------|------------|-----------|
| **Throughput** | 117 req/s | 68 req/s | **+72% faster** |
| **Total Requests** | 36,300 | 19,800 | **+83% more requests** |
| **Latency (mean)** | 0.9 ms | 0.6 ms | Comparable |
| **Latency (p50)** | 1 ms | 1 ms | Same performance |
| **Latency (p95)** | 3 ms | 1 ms | - |
| **Latency (p99)** | 7.9 ms | 2 ms | - |
| **Avg Response Size** | 1,311 bytes | 1,352 bytes | **-3% smaller** |
| **Max Latency** | 84 ms | 76 ms | Comparable |
| **Errors** | 0 | 0 | Both stable |

**Key Takeaway:** wouter-vue processes **72% more requests per second** (117 vs 68 req/s) with **identical median latency** (1ms) compared to vue-router, while handling **nearly double the total requests** (36,300 vs 19,800) in the same timeframe, making it ideal for high-traffic applications.

## Installation

```bash
npm install wouter-vue
# or
pnpm add wouter-vue
# or
yarn add wouter-vue
```

**Requirements:** Vue 3.5.22 or higher

## Quick Start

```vue
<template>
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

## License

MIT

## Acknowledgements

**wouter-vue** is inspired by the original [wouter](https://github.com/molefrog/wouter) router for React and Preact.
