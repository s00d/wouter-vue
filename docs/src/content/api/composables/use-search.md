---
title: useSearch
description: Get the current URL search string
section: API Reference
order: 36
---

# useSearch

Get the current URL search string (query string).

## Description

Returns a reactive `Ref<string>` containing the current URL search string (everything after `?` in the URL).

## Returns

```typescript
Ref<string>
```

## Example

```vue
<script setup>
import { useSearch } from 'wouter-vue';

const search = useSearch();

// For URL: /about?page=2&sort=asc
// search.value === 'page=2&sort=asc'
</script>

<template>
  <div>Search: {{ search }}</div>
</template>
```

## Parse Search Params

To parse the search string into an object, use `useSearchParams()` instead:

```vue
<script setup>
import { useSearchParams } from 'wouter-vue';

const [searchParams] = useSearchParams();

// For URL: /about?page=2&sort=asc
// searchParams.value.get('page') === '2'
// searchParams.value.get('sort') === 'asc'
</script>
```


