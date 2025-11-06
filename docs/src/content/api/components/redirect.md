---
title: Redirect
description: Redirect to another route programmatically
section: API Reference
order: 45
---

# Redirect

Redirects to another path. In SSR mode, it automatically sets `ssrContext.redirectTo` to allow the server to send HTTP redirects.

## Description

The `<Redirect>` component immediately redirects to the specified path when rendered. It's useful for:
- Legacy route redirects
- Authentication redirects
- Default route redirects

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string?` | `undefined` | Target path to redirect to |
| `to` | `string?` | `undefined` | Alias for `href` |
| `replace` | `boolean?` | `false` | Replace history entry instead of pushing |

## Usage

**Simple redirect:**

```vue
<template>
  <Route path="/old-path">
    <Redirect href="/new-path" />
  </Route>
</template>
```

**Redirect with replace:**

```vue
<template>
  <Route path="/">
    <Redirect href="/dashboard" replace />
  </Route>
</template>
```

**SSR redirect:**

In SSR mode, `<Redirect>` automatically sets the redirect status:

```vue
<template>
  <Route path="/legacy">
    <Redirect href="/new" />
  </Route>
</template>
```

On the server, this will trigger an HTTP redirect response.

## Notes

- Redirect happens immediately when the component renders
- In SSR, redirects are handled automatically by the SSR context
- See [Server-Side Rendering](/server-side-rendering) for SSR details


