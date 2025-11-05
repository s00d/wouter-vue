import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

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

    const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
    const html = await renderToString(app);
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}

