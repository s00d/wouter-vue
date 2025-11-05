---
title: useSearchParams
description: Get and manipulate URL search parameters
---

# useSearchParams

Get and manipulate URL search parameters.

## Description

Returns a tuple `[searchParams, setSearchParams]` where:
- `searchParams` is a reactive `Ref<URLSearchParams>` containing parsed query parameters
- `setSearchParams` is a function to update search parameters

## Returns

```typescript
[Ref<URLSearchParams>, (params: Record<string, string | null>) => void]
```

## Example

```vue
<script setup>
import { useSearchParams } from 'wouter-vue';

const [searchParams, setSearchParams] = useSearchParams();

// For URL: /about?page=2&sort=asc
// searchParams.value.get('page') === '2'
// searchParams.value.get('sort') === 'asc'

function updatePage(newPage) {
  setSearchParams({ page: newPage });
}

function removeSort() {
  setSearchParams({ sort: null });
}
</script>

<template>
  <div>
    <p>Page: {{ searchParams.get('page') }}</p>
    <p>Sort: {{ searchParams.get('sort') }}</p>
    <button @click="updatePage('3')">Go to page 3</button>
    <button @click="removeSort">Remove sort</button>
  </div>
</template>
```

## setSearchParams Behavior

- Setting a value: `setSearchParams({ page: '2' })` - adds or updates the parameter
- Removing a value: `setSearchParams({ page: null })` - removes the parameter
- Multiple parameters: `setSearchParams({ page: '2', sort: 'asc' })` - updates multiple at once

## Notes

- `URLSearchParams` is the standard browser API
- Changes to search params update the URL without page reload
- All updates are reactive and trigger component updates


