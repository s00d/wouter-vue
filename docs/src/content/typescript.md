---
title: TypeScript
description: TypeScript support in wouter-vue
---

# TypeScript

wouter-vue includes full TypeScript definitions.

## Type Definitions

All types are exported from `wouter-vue`:

```typescript
import type { 
  RouteParams, 
  RouteData, 
  LocationHook,
  NavigateOptions 
} from 'wouter-vue';
```

## Component Props

Components accept typed props:

```typescript
import { Route } from 'wouter-vue';

<Route 
  path="/users/:id" 
  :component="UserPage" 
  :data="{ title: 'User' }" 
/>
```

## Composables

Composables return typed values:

```typescript
import { useParams, useRouteData } from 'wouter-vue';

const params = useParams(); // Ref<RouteParams>
const routeData = useRouteData(); // Ref<RouteData>
```

## Type Checking

Enable strict type checking in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["vite/client"]
  }
}
```

## Notes

- All types are included in the package
- No `@types/wouter-vue` needed
- Full IDE autocomplete support


