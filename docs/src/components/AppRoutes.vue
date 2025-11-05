<template>
  <Layout>
    <Suspense>
      <AnimatedSwitch name="slide" mode="out-in">
        <Route
          v-for="route in routes"
          :key="route.path"
          :path="route.path"
          :component="route.pageComponent"
        />
        <Route :component="NotFoundPage" />
        </AnimatedSwitch>

      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </Layout>
</template>

<script setup>
import { Suspense, defineAsyncComponent, h } from 'vue';
import { Route, AnimatedSwitch } from 'wouter-vue';
import { createRoutes } from '../routes.js';
import Layout from './Layout.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import RouteWrapper from './RouteWrapper.vue';

// Generate routes from Markdown files
const routes = createRoutes().map(route => ({
  ...route,
  // Create async page component that wraps markdown with single root element
  pageComponent: defineAsyncComponent({
    loader: async () => {
      // Load the markdown component
      const component = typeof route.component === 'function' 
        ? await route.component() 
        : route.component;
      
      // Return a component with single root element (RouteWrapper)
      return {
        components: { RouteWrapper },
        setup() {
          return () => h(RouteWrapper, { component });
        },
      };
    },
  }),
}));

// 404 page component
const NotFoundPage = () => import('../pages/NotFoundPage.vue');
</script>

<style>
/* Slide transition animation for route transitions */
.slide-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>

