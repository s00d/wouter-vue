import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';

// Async component loading (built-in lazy loading in vue-router)
const HomePage = () => import('./pages/HomePage.vue');
const AboutPage = () => import('./pages/AboutPage.vue');
const UsersPage = () => import('./pages/UsersPage.vue');
const UserDetailPage = () => import('./pages/UserDetailPage.vue');
const HeavyPage = () => import('./pages/HeavyPage.vue');
const NotFoundPage = () => import('./pages/NotFoundPage.vue');

// Test routes (200 routes) - vue-router's built-in lazy loading
const testRoutes = [];
for (let i = 1; i <= 200; i++) {
  testRoutes.push({
    path: `/route${i}`,
    name: `Route${i}`,
    component: () => import(`./pages/routes/Route${i}.vue`),
  });
}

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/about', name: 'About', component: AboutPage },
  { path: '/users', name: 'Users', component: UsersPage },
  { path: '/users/:id', name: 'UserDetail', component: UserDetailPage },
  { path: '/heavy', name: 'Heavy', component: HeavyPage },
  ...testRoutes,
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
];

// Use memory history for SSR, web history for client
const isSSR = typeof window === 'undefined';
const router = createRouter({
  history: isSSR ? createMemoryHistory() : createWebHistory(),
  routes,
});

export default router;
