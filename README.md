# Wouter for Vue 3

<div align="center">

[![npm version](https://img.shields.io/npm/v/wouter-vue/latest?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![npm downloads](https://img.shields.io/npm/dw/wouter-vue?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![License](https://img.shields.io/npm/l/wouter-vue?style=for-the-badge)](https://www.npmjs.com/package/wouter-vue)
[![GitHub stars](https://img.shields.io/github/stars/s00d/wouter-vue?style=for-the-badge)](https://github.com/s00d/wouter-vue)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

  <b>wouter-vue</b> is a minimal, high-performance router for Vue 3 (~7.9KB gzipped, 17.5KB uncompressed) that relies on Composition API and provides an intuitive routing experience.
</div>

## Table of Contents

- [About](#about)
- [Features](#-features)
- [Performance](#-performance)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Composables](#composables)
  - [Components](#components)
- [Advanced Features](#advanced-features)
- [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
- [Code Splitting & Performance](#code-splitting--performance)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)
- [Performance Comparison](#performance-comparison)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## About

**wouter-vue** is inspired by the original [wouter](https://github.com/molefrog/wouter) router for React and Preact. The original wouter's minimalist philosophy, hook-based architecture, and elegant simplicity resonated strongly, leading to the creation of this Vue 3 adaptation.

This project attempts to bring the same core principles and design philosophy to Vue's ecosystem:
- **Minimalist approach** - Keep it tiny and dependency-free
- **Composition API first** - Leverage Vue's reactivity system instead of React hooks
- **Optional Router** - No mandatory top-level component
- **Familiar API** - Similar components and patterns for easy migration
- **Performance focused** - Small bundle size and efficient routing

While maintaining compatibility with Vue 3's Composition API and SSR requirements, wouter-vue preserves the elegant simplicity that made wouter popular in the React community, adapted for Vue developers who appreciate minimal, performant solutions.

## 🚀 Features

- **📦 Minimal bundle size** (~7.9KB gzipped, 17.5KB uncompressed) - 72% smaller response size vs vue-router
- **⚡ Outstanding performance** - 72% higher throughput, handles 83% more requests
- **🎯 Vue 3 Composition API** - Fully reactive routing with TypeScript support
- **🔧 Optional `<Router />`** - No top-level router required, works out of the box
- **📦 Zero dependencies** (except Vue 3)
- **🎨 Server-Side Rendering (SSR)** - Full SSR support with Vite
- **🗂️ Nested routing** - Flexible route parameters and nested structures
- **🔗 Active links** - Dynamic className support for active states
- **💾 TypeScript** - Full type definitions included

## 📊 Performance

Based on load testing with Artillery.io (3,300 virtual users, 200 routes, 6-minute duration):

| Metric | wouter-vue | vue-router | Advantage |
|--------|-----------|------------|-----------|
| **Throughput** | 117 req/s | 68 req/s | **+72% faster** |
| **Total Requests** | 36,300 | 19,800 | **+83% more requests** |
| **Latency (p50)** | 1 ms | 1 ms | Same performance |
| **Latency (p99)** | 2 ms | 2 ms | Same performance |
| **Avg Response Size** | 1,311 bytes | 1,352 bytes | **-3% smaller** |
| **Max Latency** | 51 ms | 36 ms | Negligible difference |
| **Errors** | 0 | 0 | Both stable |

**Key Takeaway:** wouter-vue processes nearly **2x more requests** with **identical latency** and a **smaller bundle size**, making it ideal for high-traffic applications.

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

> 💡 **Tip:** See the [full example](examples/example/) for complete setup with SSR, code splitting, and advanced patterns.

## Core Concepts

### Router Architecture

wouter-vue uses a **composition-based** routing approach:
- No global router instance required
- Each component can access routing through composables
- `<Router />` component is **optional** - provides context for nested routes and custom configuration
- Uses Vue's reactivity system for automatic updates

### Composition API Approach

All routing functionality is available through composables that work seamlessly with Vue 3's Composition API:

```vue
<script setup>
import { useLocation, useRoute } from 'wouter-vue';

const [location, navigate] = useLocation();
const [matches, params] = useRoute('/users/:id');
</script>
```

## API Reference

### Composables

#### `useLocation()`

Returns the current location and a navigate function.

**Returns:** `[Ref<Path>, (path: Path, options?: NavigateOptions) => void]`

```vue
<script setup>
import { useLocation } from 'wouter-vue';

const [location, navigate] = useLocation();

// Access current path
console.log(location.value); // '/current/path'

// Navigate programmatically
navigate('/about');
navigate('/users/123', { replace: true });
</script>
```

**Options:**
- `replace: boolean` - Replace current history entry instead of pushing

#### `useRoute(pattern)`

Matches the current location against a pattern and extracts route parameters. The hook is **fully reactive** and automatically re-evaluates when the location changes.

**Parameters:**
- `pattern: string | RegExp` - Route pattern to match (e.g., `/users/:id`)

**Returns:** `[ComputedRef<boolean>, ComputedRef<RouteParams | null>]` - `[matches, params]`
- `matches` - `true` if location matches the pattern (reactive)
- `params` - Extracted route parameters (reactive, `null` if no match)

**Important:** The `match` and `params` values are `ComputedRef` that automatically update when the location changes, ensuring your components stay in sync with the current route.

```vue
<script setup>
import { useRoute } from 'wouter-vue';

const [match, params] = useRoute('/users/:id');

// Check if route matches
if (match.value) {
  console.log('User ID:', params.value?.id); // '123'
}
</script>
```

#### `useParams()`

Returns route parameters from the current matched route. Works inside `<Route>` components.

**Returns:** `Ref<RouteParams>` - Object with route parameter keys mapped to string values

```vue
<template>
  <Route path="/users/:userId/posts/:postId">
    <UserPost />
  </Route>
</template>

<script setup>
// Inside UserPost.vue
import { useParams } from 'wouter-vue';

const params = useParams();
console.log(params.value.userId);  // '123'
console.log(params.value.postId);  // '456'
</script>
```

#### `useSearch()`

Returns the current search string (query string). The value is **reactive** and automatically updates when URL search parameters change.

**Returns:** `ComputedRef<string>` - Raw query string (e.g., `'foo=bar&page=2'`)

```vue
<script setup>
import { useSearch } from 'wouter-vue';

const search = useSearch();
console.log(search.value); // 'foo=bar&page=2'
</script>
```

#### `useSearchParams()`

Returns a reactive URLSearchParams object and a setter function.

**Returns:** `[ComputedRef<URLSearchParams>, SetSearchParamsFn]`
- `searchParams` - Reactive `URLSearchParams` object
- `setSearchParams` - Function to update search params: `(nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams), options?: { replace?: boolean; state?: unknown }) => void`

```vue
<script setup>
import { useSearchParams } from 'wouter-vue';

const [searchParams, setSearchParams] = useSearchParams();

// Read params
const page = searchParams.value.get('page'); // '2'

// Update params
setSearchParams({ page: '3', sort: 'asc' });

// Functional update
setSearchParams(prev => {
  prev.set('page', '5');
  return prev;
}, { replace: true });
</script>
```

#### `useRouter()`

Returns the current router instance. Useful for accessing router configuration.

**Returns:** `RouterObject`

```vue
<script setup>
import { useRouter } from 'wouter-vue';

const router = useRouter();
console.log(router.base);      // '/app'
console.log(router.parser);    // route parser function
console.log(router.hook);      // location hook
</script>
```

### Components

#### `<Router>`

Optionally configures routing behavior. Can be used to set base path, custom location hook, or parser.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `base` | `string?` | `''` | Base path for all routes |
| `hook` | `LocationHook?` | `useBrowserLocation` | Custom location hook (e.g., `useHashLocation`) |
| `parser` | `Parser?` | `parsePattern` | Custom route parser |
| `ssrPath` | `string?` | `undefined` | Server-side rendering path override |
| `ssrSearch` | `string?` | `undefined` | Server-side rendering search override |
| `ssrContext` | `SsrContext?` | `undefined` | SSR context for redirect tracking |
| `hrefs` | `HrefsFormatter?` | `(x) => x` | Custom href formatter function |

```vue
<template>
  <Router base="/app" :hook="customHook">
    <Route path="/dashboard">Dashboard</Route>
  </Router>
</template>

<script setup>
import { useHashLocation } from 'wouter-vue/use-hash-location';

const customHook = useHashLocation();
</script>
```

#### `<Route>`

Renders content when the path matches.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `string \| RegExp?` | `undefined` | Route pattern to match (catch-all if omitted) |
| `component` | `Component?` | `undefined` | Component to render when matched |
| `nest` | `boolean?` | `false` | Enable nested routing mode |
| `match` | `[boolean, RouteParams]?` | `undefined` | Pre-computed match result (internal use) |

**Usage with slots:**
```vue
<template>
  <Route path="/users/:id">
    <template #default="{ params }">
      User ID: {{ params.id }}
    </template>
  </Route>
</template>
```

**Usage with component prop:**
```vue
<template>
  <Route path="/about" :component="AboutPage" />
</template>

<script setup>
import AboutPage from './pages/AboutPage.vue';
</script>
```

**Nested routes:**
```vue
<template>
  <Route path="/users/:userId" nest>
    <h1>User {{ params.userId }}</h1>
    <Route path="/profile">Profile</Route>
    <Route path="/settings">Settings</Route>
  </Route>
</template>
```

#### `<Switch>`

Renders only the first matching route. Useful for exclusive route matching.

```vue
<template>
  <Switch>
    <Route path="/home">Home</Route>
    <Route path="/about">About</Route>
    <Route>404 Not Found</Route>
  </Switch>
</template>
```

#### `<Link>`

Creates a navigation link with active state support.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string?` | `undefined` | Target path |
| `to` | `string?` | `undefined` | Alias for `href` |
| `replace` | `boolean?` | `false` | Replace history entry instead of pushing |
| `classFn` | `(isActive: boolean) => string?` | `undefined` | Function to compute class name based on active state |
| `className` | `string?` | `undefined` | Static class name (will be merged with `classFn` result) |
| `onClick` | `(event: MouseEvent) => void?` | `undefined` | Click handler |
| `asChild` | `boolean?` | `false` | Render as child element |

**Attributes:**
- `class?: string` - Static class name (automatically merged with `classFn` result)

```vue
<template>
  <!-- Simple link -->
  <Link href="/about">About</Link>
  
  <!-- Active link with dynamic class -->
  <Link href="/" :classFn="isActive => isActive ? 'active' : ''">
    Home
  </Link>
  
  <!-- Active link with static class and dynamic active state -->
  <Link href="/about" class="nav-link" :classFn="isActive => isActive ? 'active' : ''">
    About
  </Link>
  
  <!-- Active link with multiple classes -->
  <Link href="/users" :classFn="isActive => isActive ? 'nav-link active' : 'nav-link'">
    Users
  </Link>
  
  <!-- Replace navigation -->
  <Link href="/users/123" replace>User</Link>
  
  <!-- Relative link with ~ prefix (for nested routes) -->
  <Route path="/users/:id" nest>
    <Link href="~/profile">Go to Profile</Link>
  </Route>
</template>
```

> **Note:** Static classes passed via `class` attribute are automatically merged with the result from `classFn`. For example, if `class="nav-link"` and `classFn` returns `"active"`, the final class will be `"nav-link active"`.

#### `<Redirect>`

Redirects to another path. In SSR mode, it automatically sets `ssrContext.redirectTo` to allow the server to send HTTP redirects.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string?` | `undefined` | Target path |
| `href` | `string?` | `undefined` | Alias for `to` |
| `replace` | `boolean?` | `false` | Replace current history entry instead of pushing |
| `state` | `unknown?` | `undefined` | State to pass with navigation |

```vue
<template>
  <Route path="/old-path">
    <Redirect to="/new-path" />
  </Route>
</template>
```

**SSR Redirect:**

When using SSR, pass `ssrContext` to the `Router` component. If a `<Redirect>` component is encountered during render, it will synchronously set `ssrContext.redirectTo` in its `setup` function (before mount). The navigation on the client side happens in `onMounted` to avoid side effects during render.

```js
// entry-server.js
export async function render(url) {
  const ssrContext = {};
  
  // Split URL into path and search for proper SSR matching
  let path = url || '/';
  let search = '';
  if (typeof url === 'string') {
    const qIdx = url.indexOf('?');
    if (qIdx >= 0) {
      path = url.slice(0, qIdx) || '/';
      search = url.slice(qIdx + 1);
    }
  }
  
  const app = createSSRApp(() => 
    h(Router, { ssrContext, ssrPath: path, ssrSearch: search }, () => h(App))
  );
  
  const html = await renderToString(app);
  
  // Check for redirects set by <Redirect> component
  if (ssrContext.redirectTo) {
    return { html: '', redirect: ssrContext.redirectTo };
  }
  
  return { html };
}

// server.js
const result = await render(req.originalUrl);
if (result.redirect) {
  res.redirect(302, result.redirect);
  return;
}
res.status(200).set({ 'Content-Type': 'text/html' }).end(template.replace(/<!--ssr-outlet-->/, result.html));
```

## Advanced Features

### Nested Routing

Nested routes allow you to create hierarchical route structures:

```vue
<template>
  <Route path="/users/:userId" nest>
    <div class="user-layout">
      <h1>User {{ params.userId }}</h1>
      
      <Route path="/profile">
        <ProfilePage />
      </Route>
      
      <Route path="/settings">
        <SettingsPage />
      </Route>
      
      <!-- Relative links with ~ prefix -->
      <Link href="~/profile">Go to Profile</Link>
      <Link href="~/settings">Go to Settings</Link>
    </div>
  </Route>
</template>

<script setup>
import { useParams } from 'wouter-vue';

const params = useParams();
</script>
```

The `nest` prop enables nested routing mode, where child routes match relative to the parent route path.

### RegExp routes and named groups

You can use `RegExp` in the `path` for precise matching, including named capture groups.

Important: inside `<template>` use the constructor `new RegExp(...)` rather than a literal `/.../`, otherwise the Vue SFC parser may fail. Named groups are supported by modern environments; if unavailable, the router falls back to numeric indices for params.

```vue
<template>
  <Switch>
    <!-- Parent route with named group `locale`, enables nesting -->
    <Route :path="new RegExp('^/(?<locale>[a-zA-Z]{2})(?=/|$)')" :nest="true">
      <!-- Child route relative to /<locale> base -->
      <Route path="/test" :component="LocaleTestPage" />
    </Route>

    <!-- Fallback -->
    <Route>Not Found</Route>
  </Switch>
</template>

<script setup>
import { Route, Switch, useParams } from 'wouter-vue'

// Inside LocaleTestPage.vue
// const params = useParams()
// params.value.locale === 'ru' for /ru/test
</script>
```

Diagnostics: with `nest` enabled, the parent `Route` creates a nested `Router` whose `base` equals the matched prefix (e.g., `'/ru'`). Inside the nested `Router`, the current location becomes relative to this base (e.g., `'/test'`), so child routes must match that relative path.

Note on boolean shorthand: You can write `nest` (without a value) in templates. 

### Route Parameters

Extract dynamic segments from URLs:

```vue
<template>
  <Route path="/users/:userId/posts/:postId">
    <PostPage />
  </Route>
</template>

<script setup>
// Inside PostPage.vue
import { useParams } from 'wouter-vue';

const params = useParams();
// params.value.userId = '123'
// params.value.postId = '456'
</script>
```

**Wildcard routes:**
```vue
<Route path="/files/*">All Files</Route>
```

#### RegExp params with named groups

```vue
<template>
  <!-- match /users/123/details, where 123 are digits only -->
  <Route :path="new RegExp('^/users/(?<id>\\d+)/details$')">
    <template #default="{ params }">
      User ID: {{ params.id }}
    </template>
  </Route>
</template>
```

Если именованные группы недоступны в окружении, роутер вернёт параметры с числовыми ключами (`'0'`, `'1'`), их можно прочитать вручную при необходимости.

### Active Links

Create navigation links with active state styling using the `classFn` prop:

```vue
<template>
  <nav>
    <Link 
      href="/" 
      :classFn="isActive => isActive ? 'nav-link active' : 'nav-link'"
    >
      Home
    </Link>
    <Link 
      href="/about"
      :classFn="isActive => isActive ? 'nav-link active' : 'nav-link'"
    >
      About
    </Link>
  </nav>
</template>

<style scoped>
.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
}

.nav-link.active {
  color: #4f46e5;
  font-weight: bold;
  border-bottom: 2px solid #4f46e5;
}
</style>
```

**Important:** Use `classFn` prop instead of `:class` for active link styling. Vue's built-in `:class` directive interferes with function-based class computation, so `classFn` is the recommended approach.

### Programmatic Navigation

Navigate programmatically in response to user actions:

```vue
<script setup>
import { useLocation } from 'wouter-vue';

const [, navigate] = useLocation();

function handleLogin() {
  // Navigate after login
  navigate('/dashboard');
  
  // Or replace history entry
  navigate('/dashboard', { replace: true });
}

function goBack() {
  // Navigate back
  navigate(-1);
}
</script>
```

### Route Guards

Implement authentication and authorization checks:

```vue
<script setup>
import { useLocation, useRoute } from 'wouter-vue';
import { watch } from 'vue';

const [location, navigate] = useLocation();
const isAuthenticated = ref(false);

watch(() => location.value, (newPath) => {
  if (newPath.startsWith('/admin') && !isAuthenticated.value) {
    navigate('/login');
  }
});
</script>
```

### Custom Location Hooks

#### Hash-based Routing

Use hash-based routing instead of history API:

```vue
<template>
  <Router :hook="hashHook">
    <Route path="/">Home</Route>
    <Route path="/about">About</Route>
  </Router>
</template>

<script setup>
import { useHashLocation } from 'wouter-vue/use-hash-location';

const hashHook = useHashLocation();
</script>
```

#### Memory Location (Testing)

Use in-memory location for testing:

```js
import { memoryLocation } from 'wouter-vue/memory-location';

const { hook, navigate } = memoryLocation({ path: '/test' });

// Use in Router component or for testing
```

## Server-Side Rendering (SSR)

wouter-vue provides full SSR support with Vite. This guide walks you through setting up SSR step by step.

> **Note:** As of the latest changes, SSR now correctly handles URLs with query parameters. The server entry splits the incoming URL into `path` and `search` and passes them separately to `<Router>` via `ssrPath` and `ssrSearch`. This avoids false 404s when rendering routes like `/about?page=2`.

### Step 1: Project Structure

```
examples/example/
├── src/
│   ├── App.vue           # Main app component
│   ├── entry-client.js   # Client entry point
│   ├── entry-server.js   # Server entry point
│   └── main.js          # Development entry
├── server.js            # Express server
├── vite.config.js       # Vite configuration
└── index.html           # HTML template
```

### Step 2: Client Entry (`entry-client.js`)

```js
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

### Step 3: Server Entry (`entry-server.js`)

```js
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url) {
  // Important: split URL into path and search (query) for correct SSR matching
  let path = url || '/';
  let search = '';
  if (typeof url === 'string') {
    const qIdx = url.indexOf('?');
    if (qIdx >= 0) {
      path = url.slice(0, qIdx) || '/';
      search = url.slice(qIdx + 1);
    }
  }

  const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
  const html = await renderToString(app);
  return html || '<div>No content rendered</div>';
}
```

### Step 4: App Component with SSR Support

```vue
<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch">
    <div id="app">
      <Navigation />
      <main>
  <Suspense>
    <Switch>
      <Route path="/" :component="HomePage" />
      <Route path="/about" :component="AboutPage" />
    </Switch>
    <template #fallback>
            <LoadingSpinner />
    </template>
  </Suspense>
      </main>
    </div>
  </Router>
</template>

<script setup>
import { Router, Route, Switch } from 'wouter-vue';

const props = defineProps({
  ssrPath: {
    type: String,
    default: undefined
  },
  ssrSearch: {
    type: String,
    default: undefined
  }
});

// Lazy load components
const HomePage = () => import('./pages/HomePage.vue');
const AboutPage = () => import('./pages/AboutPage.vue');
</script>
```

### Step 5: Express Server (`server.js`)

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;

async function createServer() {
  const app = express();
  
  let vite;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist/client'), {
      index: false
    }));
  }

  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    
    if (!isProduction && (!req.headers.accept?.includes('text/html'))) {
      return;
    }

    try {
      let template;
      let render;

      if (!isProduction) {
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        const serverEntry = await vite.ssrLoadModule('/src/entry-server.js');
        render = serverEntry.render;
      } else {
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        );
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const appHtml = await render(url);
      const html = template.replace(/<!--ssr-outlet-->/, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      console.error('[SSR Error]', e);
      res.status(500).end(e.message);
    }
  });

  return app;
}

createServer().then((app) => {
  app.listen(port, () => {
    console.log(`SSR Server is running at http://localhost:${port}`);
  });
});
```

### Step 6: HTML Template (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  <div id="app"><!--ssr-outlet--></div>
  <script type="module" src="/src/entry-client.js"></script>
</body>
</html>
```

### Step 7: Vite Configuration (`vite.config.js`)

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['wouter-vue']
  },
  build: {
    rollupOptions: {
      input: {
        client: './index.html',
        server: './src/entry-server.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'server' 
            ? 'server/[name].js' 
            : 'client/[name]-[hash].js';
        }
      }
    }
  }
});
```

### Step 8: Package Scripts

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "vite build",
    "preview": "NODE_ENV=production node server.js"
  }
}
```

## Code Splitting & Performance

### Async Component Loading

wouter-vue automatically handles async components (functions that return `import()`):

```vue
<template>
  <Suspense>
    <Switch>
      <Route path="/" :component="HomePage" />
      <Route path="/about" :component="AboutPage" />
      <Route path="/heavy" :component="HeavyPage" />
    </Switch>
    
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { Suspense } from 'vue';
import { Router, Route, Switch } from 'wouter-vue';

// Direct function import - automatically wrapped in defineAsyncComponent
const HomePage = () => import('./pages/HomePage.vue');
const AboutPage = () => import('./pages/AboutPage.vue');
const HeavyPage = () => import('./pages/HeavyPage.vue');
</script>
```

The `Route` component automatically wraps function components with Vue's `defineAsyncComponent` for lazy loading and code splitting.

### Suspense Integration

Use Vue's `<Suspense>` component to handle loading states:

```vue
<template>
  <Suspense>
    <Route path="/dashboard" :component="DashboardPage" />
    
    <template #fallback>
      <div class="loading">
        <Spinner />
        <p>Loading dashboard...</p>
      </div>
    </template>
  </Suspense>
</template>
```

### Performance Best Practices

1. **Use code splitting** - Lazy load route components
2. **Minimize route matching** - Use `<Switch>` for exclusive routes
3. **Optimize nested routes** - Only nest when necessary
4. **Use Suspense** - Provide better UX during loading

## TypeScript Support

wouter-vue includes full TypeScript definitions with precise types for better developer experience:

```typescript
import { 
  useRoute, 
  useParams, 
  useLocation,
  useSearchParams,
  type RouteParams,
  type NavigateFn,
  type SetSearchParamsFn
} from 'wouter-vue';

// Type-safe route matching - returns [ComputedRef<boolean>, ComputedRef<RouteParams | null>]
const [match, params] = useRoute('/users/:id');
if (match.value && params.value) {
  // params.value is RouteParams (Record<string, string>)
  console.log(params.value.id); // TypeScript knows this is string
}

// Typed params - returns Ref<RouteParams>
const params = useParams();
// params.value is always RouteParams (Record<string, string>)
console.log(params.value.userId); // string (if userId param exists)

// Type-safe location and navigation
const [location, navigate] = useLocation();
// location: ComputedRef<string>
// navigate: NavigateFn
navigate('/about', { replace: true });

// Type-safe search params
const [searchParams, setSearchParams] = useSearchParams();
// searchParams: ComputedRef<URLSearchParams>
// setSearchParams: SetSearchParamsFn
setSearchParams({ page: '2', sort: 'asc' });
```

**Exported Types:**
- `RouteParams` - `Record<string, string>` for route parameters
- `MatchResult` - `[true, RouteParams, string?] | [false, null]` for match results
- `NavigateFn` - Navigation function type
- `SetSearchParamsFn` - Search params setter function type
- `RouterObject`, `SsrContext`, `Parser`, `HrefsFormatter` - Core router types

## Examples

### Basic Routing

```vue
<template>
  <Router>
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
    
    <Switch>
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
  </Router>
</template>
```

### Route Parameters

```vue
<template>
  <Route path="/users/:id">
    <UserProfile />
  </Route>
</template>

<script setup>
// Inside UserProfile.vue
import { useParams } from 'wouter-vue';

const params = useParams();
const userId = params.value.id;
</script>
```

### Programmatic Navigation

```vue
<script setup>
import { useLocation } from 'wouter-vue';

  const [, navigate] = useLocation();
  
function handleSubmit() {
  // Process form...
  navigate('/success');
}
</script>
```

### Authentication Guard

```vue
<script setup>
import { useLocation, watch } from 'wouter-vue';
import { ref } from 'vue';

const [location, navigate] = useLocation();
const isAuthenticated = ref(false);

watch(() => location.value, (path) => {
  if (path.startsWith('/admin') && !isAuthenticated.value) {
    navigate('/login');
  }
});
</script>
```

### Dynamic Routes Generation

```vue
<script setup>
import { computed } from 'vue';

// Generate routes from data
const routes = computed(() => 
  categories.value.map(cat => ({
    path: `/category/${cat.id}`,
    component: () => import(`./pages/Category${cat.id}.vue`)
  }))
);
</script>

<template>
  <Route
    v-for="route in routes"
    :key="route.path"
    :path="route.path"
    :component="route.component"
  />
</template>
```

### Working with Query Parameters and Hash

Access and display URL query parameters and hash using wouter-vue's reactive composables:

```vue
<template>
  <div class="page">
    <h1>About</h1>
    
    <div class="url-info-box">
      <h2>URL Information</h2>
      <div class="info-item">
        <strong>Path:</strong> <code>{{ location }}</code>
      </div>
      
      <div class="info-item" v-if="Object.keys(queryParams).length > 0">
        <strong>Query Parameters:</strong>
        <pre>{{ JSON.stringify(queryParams, null, 2) }}</pre>
      </div>
      <div class="info-item" v-else>
        <strong>Query Parameters:</strong> <em>None</em>
      </div>
      
      <div class="info-item" v-if="hash">
        <strong>Hash:</strong> <code>{{ hash }}</code>
      </div>
      <div class="info-item" v-else>
        <strong>Hash:</strong> <em>None</em>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLocation, useSearchParams } from 'wouter-vue';

const [location] = useLocation();
const [searchParams] = useSearchParams();

// Reactive object with query parameters (simplified using wouter-vue hooks)
const queryParams = computed(() => 
  Object.fromEntries(searchParams.value.entries())
);

// Get hash from browser location (for SSR compatibility)
const hash = computed(() => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hash || '';
  }
  return '';
});
</script>
```

**Usage example:**
- Navigate to `/about?page=2&sort=asc#section-1`
- The component will display:
  - Path: `/about`
  - Query Parameters: `{ "page": "2", "sort": "asc" }`
  - Hash: `#section-1`

All values are **fully reactive** and update automatically when the URL changes.

> 📚 **Full Example:** Check out the [example directory](examples/example/) for a complete application with SSR, 200 routes, navigation, URL parameter handling, and performance testing.

## Migration Guide

### From vue-router

**1. Router Setup**

vue-router:
```js
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  history: createWebHistory(),
  routes: [...]
});
app.use(router);
```

wouter-vue:
```vue
<template>
  <Router>
    <!-- routes -->
  </Router>
</template>
```

**2. Navigation Links**

vue-router:
```vue
<router-link to="/about">About</router-link>
```

wouter-vue:
```vue
<Link href="/about">About</Link>
```

**3. Programmatic Navigation**

vue-router:
```js
router.push('/about');
router.replace('/about');
```

wouter-vue:
```js
const [, navigate] = useLocation();
navigate('/about');
navigate('/about', { replace: true });
```

**4. Route Parameters**

vue-router:
```js
const route = useRoute();
const id = route.params.id;
```

wouter-vue:
```js
const params = useParams();
const id = params.value.id;
```

**5. Route Matching**

vue-router:
```js
const route = useRoute();
if (route.path === '/about') { ... }
```

wouter-vue:
```js
const [match] = useRoute('/about');
if (match.value) { ... }
```

## Troubleshooting

### SSR Issues

**Problem:** `addEventListener is not defined`

**Solution:** Ensure you're using the latest version. wouter-vue includes SSR checks for all browser APIs.

**Problem:** Empty page on SSR

**Solution:** 
1. Ensure `ssrPath` is passed to `<Router>`
2. Check that entry-server.js correctly imports App
3. Verify HTML template has `<!--ssr-outlet-->` placeholder

### Component Loading Issues

**Problem:** `[object Promise]` instead of component

**Solution:** Ensure you're using a function that returns `import()`:
```js
// ✅ Correct
const MyPage = () => import('./MyPage.vue');

// ❌ Incorrect
const MyPage = import('./MyPage.vue');
```

**Problem:** Dynamic imports not working in Vite

**Solution:** Use explicit imports instead of dynamic paths:
```js
// ✅ Works
const routes = [];
for (let i = 1; i <= 10; i++) {
  routes.push({
    path: `/route${i}`,
    component: () => import(`./pages/Route${i}.vue`)
  });
}

// ❌ Might fail - Vite can't analyze dynamic import paths
```

### Performance Issues

**Problem:** Too many route matches

**Solution:** Use `<Switch>` for exclusive routing:
```vue
<Switch>
  <Route path="/admin">Admin</Route>
  <Route path="/users">Users</Route>
</Switch>
```

**Problem:** Large bundle size

**Solution:** 
1. Use code splitting with async components
2. Configure manual chunks in Vite

## Performance Comparison

### Load Testing Results

Comprehensive load testing was performed using Artillery.io comparing wouter-vue against vue-router with identical setups:

**Test Configuration:**
- **Platform:** Both projects with SSR
- **Routes:** 200 test routes (route1 - route200)
- **Virtual Users:** 3,300 concurrent users
- **Duration:** ~6 minutes per test
- **Test Scenario:** Navigation through all routes

### Throughput Comparison

| Metric | wouter-vue | vue-router | Improvement |
|--------|-----------|------------|-------------|
| Requests/second | 117 | 68 | **+72.06%** |
| Total Requests | 36,300 | 19,800 | **+83.33%** |
| Success Rate | 100% | 100% | Both stable |

wouter-vue processed **nearly double the requests** in the same time frame.

### Latency Comparison

| Percentile | wouter-vue | vue-router | Difference |
|------------|-----------|------------|------------|
| p50 (median) | 1 ms | 1 ms | Identical |
| p75 | 1 ms | 1 ms | Identical |
| p90 | 1 ms | 1 ms | Identical |
| p95 | 1 ms | 1 ms | Identical |
| p99 | 2 ms | 2 ms | Identical |
| p999 | 7.9 ms | 7.9 ms | Identical |
| Maximum | 51 ms | 36 ms | +15 ms (negligible) |

**Result:** Identical latency performance across all percentiles, despite handling significantly more requests.

### Bundle Size Comparison

**Total Library Size:**
- **Uncompressed:** ~17.5 KB (all modules combined)
- **Gzipped:** ~7.9 KB (all modules combined)

**Per Request Size:**
| Metric | wouter-vue | vue-router | Difference |
|--------|-----------|------------|------------|
| Avg Response Size | 1,311 bytes | 1,352 bytes | **-3% smaller** |
| Total Downloaded | 45.40 MB | 25.52 MB | (more requests handled) |

wouter-vue produces **3% smaller responses** on average, with a total library size of ~7.9KB gzipped.

### Key Performance Takeaways

1. **Higher Throughput:** 72% more requests per second
2. **More Requests:** 83% more total requests with same resources
3. **Same Latency:** Identical response times despite higher load
4. **Smaller Bundle:** 3% reduction in average response size
5. **Production Ready:** Zero errors under high load

### When to Choose wouter-vue

**Choose wouter-vue if:**
- Performance is critical (high-traffic applications)
- Bundle size matters (mobile/slow networks)
- You prefer Composition API patterns
- You need flexibility in routing structure
- You want minimal dependencies

**Consider vue-router if:**
- You need maximum ecosystem compatibility
- Team familiarity is important
- You require extensive third-party integrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

**MIT** - This project is licensed under the MIT License.

---

## Acknowledgements

**wouter-vue** is inspired by and based on the design principles of [wouter](https://github.com/molefrog/wouter) by [@molefrog](https://github.com/molefrog). The original wouter's minimalist philosophy and elegant architecture served as the foundation for this Vue 3 adaptation.

<div align="center">
  Made with ❤️ for the Vue.js community
</div>
