<template>
  <Suspense>
    <AnimatedSwitch name="fade" mode="out-in" :data="routeData">
      <Route path="/" :component="HomePage" />
      <Route path="/about" :component="AboutPage" :data="aboutPageData" />
      <Route path="/users" :component="UsersPage" />
      <Route path="/users/:id" :component="UserDetailPage" />
      <Route path="/heavy" :component="HeavyPage" />
      <Route path="/:locale([a-zA-Z]{2})" nest>
        <Route path="/test" :component="LocaleTestPage" />
      </Route>
      <Route
        v-for="route in testRoutes"
        :key="route.path"
        :path="route.path"
        :component="route.component"
      />
      <Route :component="NotFoundPage" />
    </AnimatedSwitch>

    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { ref } from 'vue';
import { Suspense } from 'vue';
import { Route, AnimatedSwitch } from 'wouter-vue';
import LoadingSpinner from './LoadingSpinner.vue';

// Example: Pass reactive data to routes using ref
const routeData = ref({
  theme: 'dark',
  layout: 'default',
  version: '1.0.0',
});

// Example: Pass reactive data to specific route using ref
const aboutPageData = ref({
  pageName: 'About',
  layout: 'sidebar',
});

// You can also pass plain objects (non-reactive):
// const routeData = { theme: 'dark', layout: 'default' };
// const aboutPageData = { pageName: 'About', layout: 'sidebar' };

// Lazy loading components
const HomePage = () => import('../pages/HomePage.vue');
const AboutPage = () => import('../pages/AboutPage.vue');
const UsersPage = () => import('../pages/UsersPage.vue');
const UserDetailPage = () => import('../pages/UserDetailPage.vue');
const HeavyPage = () => import('../pages/HeavyPage.vue');
const NotFoundPage = () => import('../pages/NotFoundPage.vue');
const LocaleTestPage = () => import('../pages/LocaleTestPage.vue');

// Lazy loading test routes
const testRoutes = [];
for (let i = 1; i <= 200; i++) {
  testRoutes.push({
    path: `/route${i}`,
    component: () => import(`../pages/routes/Route${i}.vue`)
  });
}
</script>

