import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';
import { createRoutes } from './routes.js';

export async function render(url) {
  try {
    // Remove base path if present (for GitHub Pages)
    let normalizedUrl = url || '/';
    const basePath = process.env.GITHUB_PAGES ? '/wouter-vue' : '';
    
    if (basePath && normalizedUrl.startsWith(basePath)) {
      normalizedUrl = normalizedUrl.slice(basePath.length) || '/';
    }
    
    // Split URL into path and search for correct SSR routing
    let path = normalizedUrl;
    let search = '';
    if (typeof normalizedUrl === 'string') {
      const qIdx = normalizedUrl.indexOf('?');
      if (qIdx >= 0) {
        path = normalizedUrl.slice(0, qIdx) || '/';
        search = normalizedUrl.slice(qIdx + 1);
      }
    }

    // Preload the component for the current route to ensure it's available during SSR
    // This helps Suspense properly wait for async components
    const routes = createRoutes();
    const matchingRoute = routes.find(r => r.path === path);
    if (matchingRoute && typeof matchingRoute.component === 'function') {
      try {
        await matchingRoute.component();
      } catch (err) {
        console.warn(`Failed to preload component for route ${path}:`, err);
      }
    }

    const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
    const html = await renderToString(app);
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}

