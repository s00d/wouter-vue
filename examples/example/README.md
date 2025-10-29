# Wouter-Vue Example

Demo application showcasing `wouter-vue` router for Vue 3 with async component loading.

## Features

✅ Basic routing with `Route` and `Link`  
✅ Route parameters (`/users/:id`)  
✅ Async component loading with `Suspense`  
✅ Active links with dynamic className  
✅ Programmatic navigation  
✅ 404 handling  
✅ Code splitting  

## Installation

```bash
pnpm install
```

## Run

```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`

## Routes

- `/` - Home page
- `/about` - About page
- `/users` - Users list
- `/users/:id` - User details (with parameters)
- `/heavy` - Async loaded page (demonstrates code splitting)
- `/*` - 404 Not Found page

## Code Structure

```
src/
├── App.vue                    # Main app with router setup
├── main.js                    # Entry point
├── components/
│   ├── Navigation.vue         # Navigation bar
│   └── LoadingSpinner.vue    # Suspense fallback
└── pages/
    ├── HomePage.vue          # Home page
    ├── AboutPage.vue         # About page
    ├── UsersPage.vue         # Users list
    ├── UserDetailPage.vue    # User details (with params)
    ├── HeavyPage.vue         # Async loaded component
    └── NotFoundPage.vue      # 404 page
```

## Key Features Demonstrated

### Async Component Loading

```vue
<template>
  <Suspense>
    <Route path="/heavy" :component="HeavyPageAsync" />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const HeavyPageAsync = defineAsyncComponent(() => 
  import('./pages/HeavyPage.vue')
);
</script>
```

### Route Parameters

```vue
<script setup>
import { useParams } from 'wouter-vue';

const params = useParams();
console.log(params.id); // Access route parameters
</script>
```

### Active Links

```vue
<Link 
  href="/" 
  :class="isActive => isActive ? 'active' : ''"
>
  Home
</Link>
```

### Programmatic Navigation

```vue
<script setup>
import { useLocation } from 'wouter-vue';

const [, navigate] = useLocation();
navigate('/users/123'); // Programmatic navigation
</script>
```

## Development

The example uses the local `wouter-vue` package from the monorepo via the `workspace:*` dependency. This ensures we're always testing against the latest version of the router.

