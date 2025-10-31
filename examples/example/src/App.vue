<template>
  <Router :ssr-path="ssrPath" :ssr-search="ssrSearch">
    <div id="app">
      <Navigation />

      <main class="container">
        <Suspense>
          <Switch>
            <Route path="/" :component="HomePage" />
            <Route path="/about" :component="AboutPage" />
            <Route path="/users" :component="UsersPage" />
            <Route path="/users/:id" :component="UserDetailPage" />
            <Route path="/heavy" :component="HeavyPage" />
            <Route :path="new RegExp('^/(?<locale>[a-zA-Z]{2})(?=/|$)')" nest>
              <Route path="/test" :component="LocaleTestPage" />
            </Route>
            <Route
              v-for="route in testRoutes"
              :key="route.path"
              :path="route.path"
              :component="route.component"
            />
            <Route :component="NotFoundPage" />
          </Switch>

          <template #fallback>
            <LoadingSpinner />
          </template>
        </Suspense>
      </main>
    </div>
  </Router>
</template>

<script setup>
import { Router, Route, Switch } from 'wouter-vue';
import Navigation from './components/Navigation.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

// SSR support: get ssrPath from props if available
const props = defineProps({
  ssrPath: {
    type: String,
    default: undefined
  },
  ssrSearch: {
    type: String,
    default: undefined
  }
});

// Lazy loading components
const HomePage = () => import('./pages/HomePage.vue');
const AboutPage = () => import('./pages/AboutPage.vue');
const UsersPage = () => import('./pages/UsersPage.vue');
const UserDetailPage = () => import('./pages/UserDetailPage.vue');
const HeavyPage = () => import('./pages/HeavyPage.vue');
const NotFoundPage = () => import('./pages/NotFoundPage.vue');
const LocaleTestPage = () => import('./pages/LocaleTestPage.vue');

// (unused)

// Lazy loading test routes
const testRoutes = [];
for (let i = 1; i <= 200; i++) {
  testRoutes.push({
    path: `/route${i}`,
    component: () => import(`./pages/routes/Route${i}.vue`)
  });
}
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
