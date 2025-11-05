---
title: Route Pattern Matching
description: Complete guide to route patterns and matching
---

# Route Pattern Matching

wouter-vue uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for route pattern matching, providing full support for advanced routing patterns.

## Named Parameters

Named parameters extract values from the URL into `params`:

```vue
<template>
  <Route path="/users/:id">
    <template #default="{ params }">
      User ID: {{ params.value.id }}
    </template>
  </Route>
</template>
```

**Examples:**
- `/users/:id` matches `/users/123` → `params.id = '123'`
- `/posts/:year/:month/:day` matches `/posts/2024/01/15` → `params = { year: '2024', month: '01', day: '15' }`

## Parameter Constraints

Add constraints to validate parameter values:

```vue
<template>
  <!-- Only matches numeric IDs -->
  <Route path="/users/:id(\\d+)" :component="UserPage" />
  
  <!-- Only matches 2-letter locale codes -->
  <Route path="/:locale([a-zA-Z]{2})" nest>
    <Route path="/about" :component="AboutPage" />
  </Route>
</template>
```

**Syntax:** `/:param(pattern)` where `pattern` is a regex string.

**Common patterns:**
- `\\d+` - digits only
- `[a-z]+` - lowercase letters
- `[a-zA-Z]{2}` - exactly 2 letters
- `[0-9]{4}` - exactly 4 digits

## Wildcards

Wildcard routes match multiple path segments:

```vue
<template>
  <!-- Unnamed wildcard - automatically converted to /*splat internally -->
  <Route path="/files/*">
    <template #default="{ params }">
      File path: {{ params.value.splat }}
    </template>
  </Route>
  
  <!-- Named wildcard parameter -->
  <Route path="/files/*path">
    <template #default="{ params }">
      File path: {{ params.value.path }}
    </template>
  </Route>
</template>
```

**Notes:**
- Unnamed wildcard (`/*`) is converted to `/*splat` internally
- Wildcard values are strings containing matched segments (e.g., `"a/b/c"` for `/files/a/b/c`)

## RegExp Paths

For complex patterns requiring advanced regex features (lookaheads, alternation, etc.), use `RegExp` objects:

```vue
<template>
  <Switch>
    <!-- Parent route with named group `locale`, enables nesting -->
    <Route :path="new RegExp('^/(?<locale>[a-zA-Z]{2})(?=/|$)')" nest>
      <Route path="/test" :component="LocaleTestPage" />
    </Route>
    
    <Route>Not Found</Route>
  </Switch>
</template>
```

**Important:** Inside `<template>`, use `new RegExp(...)` constructor rather than literal `/.../`, otherwise the Vue SFC parser may fail.

**When to use:**
- **String patterns** (`:param(pattern)`) - for simple constraints (cleaner, more readable)
- **RegExp** - for complex patterns requiring advanced regex features

## Pattern Features

Supported features:
- **Named parameters** - `/:param` matches a single segment
- **Wildcard parameters** - `/*param` matches multiple segments
- **Parameter constraints** - `/:param(pattern)` with regex validation
- **Optional segments** - `/users{/:id}/delete` for optional parts
- **Custom delimiters** - Configurable via parser options

For more details, see the [path-to-regexp documentation](https://github.com/pillarjs/path-to-regexp).

