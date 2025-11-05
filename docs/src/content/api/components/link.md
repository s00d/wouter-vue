---
title: Link
description: Navigation link component with active state support
---

# Link

Creates a navigation link with active state support.

## Description

The `<Link>` component creates a navigation link that updates the URL without a full page reload. It supports active state detection through scoped slots.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string?` | `undefined` | Target path |
| `to` | `string?` | `undefined` | Alias for `href` |
| `replace` | `boolean?` | `false` | Replace history entry instead of pushing |
| `onClick` | `(event: MouseEvent) => void?` | `undefined` | Click handler |
| `asChild` | `boolean?` | `false` | Render as child element |

## Usage

**Simple link:**

```vue
<template>
  <Link href="/about">About</Link>
</template>
```

**Active link with scoped slot:**

```vue
<template>
  <Link href="/">
    <template #default="{ isActive }">
      <span :class="{ active: isActive }">Home</span>
    </template>
  </Link>
</template>

<style scoped>
.active {
  font-weight: bold;
  color: blue;
}
</style>
```

**Link with replace:**

```vue
<template>
  <Link href="/users/123" replace>User</Link>
</template>
```

**Relative link (for nested routes):**

```vue
<template>
  <Route path="/users/:id" nest>
    <Link href="~/profile">Go to Profile</Link>
    <!-- Resolves to /users/:id/profile -->
  </Route>
</template>
```

**Multiple classes:**

```vue
<template>
  <Link href="/users">
    <template #default="{ isActive }">
      <span :class="isActive ? 'nav-link active' : 'nav-link'">Users</span>
    </template>
  </Link>
</template>
```

## Active State Detection

The `isActive` value is `true` when:
- The link's path exactly matches the current location
- The link's path is a prefix of the current location (for nested routes)

## Notes

- `href` and `to` are aliases - use whichever you prefer
- Active state is computed reactively and updates automatically
- See [Nested Routing](/guides/nested-routing) for relative link examples


