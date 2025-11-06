import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url) {
  try {
    console.log(`[SSR Render] Received URL: ${url}`);
    
    let path = url || '/';
    let search = '';
    if (typeof url === 'string') {
      const qIdx = url.indexOf('?');
      if (qIdx >= 0) {
        path = url.slice(0, qIdx) || '/';
        search = url.slice(qIdx + 1);
      }
    }

    // Pass the full path to App.vue
    // Router will handle base path internally
    const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
    
    const html = await renderToString(app);
    
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}

