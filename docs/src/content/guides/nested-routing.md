---
title: Nested Routing
description: Create hierarchical route structures
section: Guides
order: 12
---

# Nested Routing

Nested routes allow you to create hierarchical route structures with automatic parameter merging.

## Basic Nested Routes

Enable nested routing with the `nest` prop:

```vue
<template>
  <Route path="/users/:userId" nest>
    <div class="user-layout">
      <h1>User {{ params.value.userId }}</h1>
      
      <Route path="/profile">
        <ProfilePage />
      </Route>
      
      <Route path="/settings">
        <SettingsPage />
      </Route>
    </div>
  </Route>
</template>
```

**How it works:**
- Parent route matches `/users/:userId` (e.g., `/users/123`)
- Child routes are relative to the parent match (`/profile` → `/users/123/profile`)
- Parameters are automatically merged from parent to child

## Accessing Parameters

**In child components:**

```vue
<script setup>
import { useParams } from 'wouter-vue';

const params = useParams();
// params.value === { userId: '123', postId: '456' }
</script>
```

**Via props:**

```vue
<!-- Route definition -->
<Route path="/users/:userId/posts/:postId" nest>
  <Route path="/comments/:commentId" :component="CommentPage" />
</Route>

<!-- CommentPage.vue -->
<script setup>
const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  }
});

console.log(props.params.userId);    // '123'
console.log(props.params.postId);   // '456'
console.log(props.params.commentId); // '789'
</script>
```

## Relative Links

Use `~` prefix for relative links in nested routes:

```vue
<template>
  <Route path="/users/:id" nest>
    <Link href="~/profile">Profile</Link>
    <!-- Resolves to /users/:id/profile -->
    
    <Link href="~/settings">Settings</Link>
    <!-- Resolves to /users/:id/settings -->
  </Route>
</template>
```

## Complex Nesting

You can nest multiple levels:

```vue
<template>
  <Route path="/users/:userId" nest>
    <Route path="/posts/:postId" nest>
      <Route path="/comments/:commentId">
        <CommentPage />
      </Route>
    </Route>
  </Route>
</template>
```

**URL:** `/users/123/posts/456/comments/789`
**Params:** `{ userId: '123', postId: '456', commentId: '789' }`

## Notes

- The `nest` prop enables nested routing mode
- Child routes are relative to the parent match
- Parameters are automatically merged from parent to child
- Use `~` prefix for relative links in nested routes

