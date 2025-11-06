---
title: Link
description: Navigation link component with active state support
section: API Reference
order: 44
---

# Link

Creates a navigation link with active state support.

## Description

The `<Link>` component creates a navigation link that updates the URL without a full page reload. It supports active state detection through scoped slots and can merge navigation behavior with custom child elements using the `asChild` prop.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string?` | `undefined` | Target path |
| `to` | `string?` | `undefined` | Alias for `href` |
| `replace` | `boolean?` | `false` | Replace history entry instead of pushing |
| `onClick` | `(event: MouseEvent) => void?` | `undefined` | Click handler |
| `asChild` | `boolean?` | `false` | Merge props with single child element instead of rendering `<a>` tag |

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

**Using `asChild` prop:**

The `asChild` prop allows you to merge navigation behavior with a custom child element instead of rendering an `<a>` tag. This is useful when you want to use a button, div, or other element as a link.

```vue
<template>
  <!-- Button as link -->
  <Link href="/about" asChild>
    <button class="btn">About</button>
  </Link>

  <!-- Custom element with existing props -->
  <Link href="/users/123" asChild>
    <div class="card" data-testid="user-card">
      User Profile
    </div>
  </Link>

  <!-- With existing onClick handler -->
  <Link href="/settings" asChild>
    <button @click="handleSettingsClick">Settings</button>
  </Link>
</template>

<script setup>
function handleSettingsClick() {
  console.log('Settings clicked')
  // Navigation will also happen automatically
}
</script>
```

**Important notes about `asChild`:**

- Requires exactly **one** child element
- Merges `href` and `onClick` props with the child element
- Child's original `onClick` handler is preserved and called before navigation
- Useful for avoiding nested `<a>` tags (e.g., `<a><button></button></a>`)

## Active State Detection

The `isActive` value is `true` when:
- The link's path exactly matches the current location
- The link's path is a prefix of the current location (for nested routes)

## Notes

- `href` and `to` are aliases - use whichever you prefer
- Active state is computed reactively and updates automatically
- See [Nested Routing](/guides/nested-routing) for relative link examples


