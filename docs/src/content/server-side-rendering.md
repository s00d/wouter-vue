---
title: Server-Side Rendering (SSR)
description: Render wouter-vue routes on the server
---

# Server-Side Rendering (SSR)

wouter-vue supports full SSR with Vite.

## Basic Setup

**entry-server.js:**

```javascript
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url) {
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

**App.vue:**

```vue
<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch">
    <AppRoutes />
  </Router>
</template>

<script setup>
const props = defineProps({
  ssrPath: String,
  ssrSearch: String
});
</script>
```

## Vite Configuration

```javascript
export default defineConfig({
  ssr: {
    noExternal: ['wouter-vue'],
  },
});
```

## Redirect Handling

`<Redirect>` automatically sets SSR redirects:

```vue
<Route path="/legacy">
  <Redirect href="/new" />
</Route>
```

## Notes

- Always wrap app with `<Router>` for SSR
- Pass `ssrPath` and `ssrSearch` props to `<Router>`
- See [full example](../../examples/example/) for complete SSR setup


