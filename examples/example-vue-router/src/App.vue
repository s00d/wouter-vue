<template>
  <div id="app">
    <Navigation />
    
    <main class="container">
      <Suspense>
        <router-view></router-view>
        
        <template #fallback>
          <LoadingSpinner />
        </template>
      </Suspense>
    </main>
  </div>
</template>

<script setup>
import { Suspense } from 'vue';
import Navigation from './components/Navigation.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>

