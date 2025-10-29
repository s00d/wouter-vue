# Vue Router Example

Demo application showcasing `vue-router` for Vue 3 with async component loading.

## Features

✅ Basic routing with `router-view` and `router-link`  
✅ Route parameters (`/users/:id`)  
✅ Async component loading with `Suspense`  
✅ Active links with dynamic className  
✅ Programmatic navigation  
 Arch 404 handling  
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
├── App.vue                    # Main app with router-view
├── main.js                    # Entry point
├── router.js                  # Vue Router configuration
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
    <router-view></router-view>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

Components are loaded asynchronously in `router.js`:
```js
const HeavyPage = () => import('./pages/HeavyPage.vue');
```

### Route Parameters

```vue
<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
console.log(route.params.id); // Access route parameters
</script>
```

### Active Links

```vue
<router-link to="/" active-class="active">
  Home
</router-link>
```

### Programmatic Navigation

```vue
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
router.push('/users/123'); // Programmatic navigation
</script>
```

## Development

The example uses the `vue-router` package for routing in Vue 3 applications.
