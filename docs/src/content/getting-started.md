---
title: Getting Started
description: Quick Start guide for wouter-vue
---

# Getting Started

Get up and running with wouter-vue in just a few minutes.

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

That's it! You now have a working router with navigation and route matching.

## What's Next?

- [Installation](/installation) - Learn how to install wouter-vue
- [Core Concepts](/core-concepts) - Understand the fundamental concepts
- [API Reference](/api/composables/use-location) - Explore the API
- [Examples](/examples) - See real-world examples


