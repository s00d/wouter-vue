<template>
  <div class="page">
    <h1>Locale Test Page</h1>
    <div class="info">
      <div class="row"><strong>Locale:</strong> <code>{{ displayLocale }}</code></div>
      <div class="row"><strong>Path:</strong> <code>{{ location }}</code></div>
      <div class="row" v-if="Object.keys(query).length">
        <strong>Query:</strong>
        <pre>{{ JSON.stringify(query, null, 2) }}</pre>
      </div>
      <div class="row" v-else>
        <strong>Query:</strong> <em>none</em>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue'
import { useParams, useLocation, useSearchParams } from 'wouter-vue'

const params = useParams()
const [location] = useLocation()
const [searchParams] = useSearchParams()

const query = computed(() => Object.fromEntries(searchParams.value.entries()))
const displayLocale = computed(() => {
  return params.value.locale || (location.value.match(/^\/([a-zA-Z]{2})\//)?.[1] ?? '')
})
</script>

<style scoped>
.page {
  display: grid;
  gap: 1rem;
}
.info {
  display: grid;
  gap: 0.5rem;
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.row code {
  background: #f3f4f6;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}
</style>


