---
title: Server-Side Rendering (SSR)
description: Render wouter-vue routes on the server
section: Other
order: 81
---

# Server-Side Rendering (SSR)

wouter-vue supports full SSR with Vite, including Static Site Generation (SSG) for pre-rendering.

## Basic Setup

**entry-server.js:**

```javascript
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url) {
  try {
    console.log(`[SSR Render] Received URL: ${url}`);
    
    let path = url || '/';
    let search = '';
    if (typeof url === 'string') {
      const qIdx = url.indexOf('?');
      if (qIdx >= 0) {
        path = url.slice(0, qIdx) || '/';
        search = url.slice(qIdx + 1);
      }
    }

    // Pass the full path to App.vue
    // Router will handle base path internally
    const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
    
    const html = await renderToString(app);
    
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}
```

**App.vue:**

```vue
<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch" :base="basePath">
    <AppRoutes />
  </Router>
</template>

<script setup>
import { Router } from 'wouter-vue';
import AppRoutes from './components/AppRoutes.vue';

// SSR support: get ssrPath from props if available
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

// Get base path from Vite's BASE_URL
// Vite guarantees this variable is available on both client and server
// Remove trailing slash (Router expects base without trailing slash)
const basePath = (import.meta.env.BASE_URL || '').replace(/\/$/, '');
</script>
```

## Vite Configuration

**vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // Base path for deployment (e.g., '/my-app/' for GitHub Pages)
  base: process.env.GITHUB_PAGES ? '/wouter-vue/' : '/',
  
  plugins: [vue()],
  
  ssr: {
    noExternal: ['wouter-vue'],
  },
  
  build: {
    rollupOptions: {
      input: {
        client: './index.html',
        server: './src/entry-server.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Server entry: fixed name without hash
          if (chunkInfo.name === 'server') {
            return 'server/[name].js';
          }
          // Client entries: with hash for cache busting
          return 'client/[name]-[hash].js';
        }
      }
    }
  }
});
```

## Base Path Configuration

When deploying to a subdirectory (like GitHub Pages), configure the base path:

1. **Set base in vite.config.js:**
   ```javascript
   base: process.env.GITHUB_PAGES ? '/wouter-vue/' : '/'
   ```

2. **App.vue automatically reads it:**
   ```javascript
   const basePath = (import.meta.env.BASE_URL || '').replace(/\/$/, '');
   ```

3. **Router handles it automatically:**
   - Passes `base` prop to `<Router>`
   - Router internally strips base from URLs
   - All navigation works correctly

## Static Site Generation (SSG)

For pre-rendering static pages, create a `prerender.js` script:

```javascript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

async function run() {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const basePath = isGitHubPages ? '/wouter-vue' : '';
  
  // Find entry-server.js
  const entryServerPath = toAbsolute('dist/server/entry-server.js');
  const { render } = await import(pathToFileURL(entryServerPath).href);
  
  const distPath = toAbsolute('dist/client');
  const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
  
  // List of routes to prerender
  const routesToPrerender = ['/', '/getting-started', '/api'];
  
  for (const routePath of routesToPrerender) {
    // Form full URL for rendering (simulates real request)
    const urlToRender = `${basePath}${routePath}`.replace(/\/+/g, '/');
    const appHtml = await render(urlToRender);
    
    // Save to file
    const filePath = routePath.endsWith('/') 
      ? path.join(routePath, 'index.html')
      : path.join(routePath, 'index.html');
    
    const fullPath = path.join(distPath, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    
    const html = template.replace(/<!--ssr-outlet-->/, appHtml);
    fs.writeFileSync(fullPath, html);
  }
}

run().catch(console.error);
```

Add to `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "prerender": "node prerender.js"
  }
}
```

## Redirect Handling

`<Redirect>` automatically sets SSR redirects:

```vue
<Route path="/legacy">
  <Redirect href="/new" />
</Route>
```

## Router Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ssrPath` | `string?` | `undefined` | Initial path for SSR (optional) |
| `ssrSearch` | `string?` | `undefined` | Initial search string for SSR (optional) |
| `base` | `string?` | `undefined` | Base path for routing (e.g., `/my-app`) |

## Notes

- Always wrap app with `<Router>` for SSR
- Pass `ssrPath` and `ssrSearch` props to `<Router>` from entry-server
- Set `base` prop automatically from `import.meta.env.BASE_URL`
- Router handles base path internally - no manual URL manipulation needed
- See [full example](../../examples/example/) for complete SSR setup
- This documentation site is built with wouter-vue SSR/SSG - see [source code](https://github.com/s00d/wouter-vue/tree/main/docs)
