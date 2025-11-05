import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url) {
  try {
    // Упрощаем: БОЛЬШЕ НЕТ ЛОГИКИ С basePath.
    // Просто передаем полученный URL дальше.
    // wouter-vue сам обработает base, который ему передаст App.vue.
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

    // В App передаем ПОЛНЫЙ путь (например, /wouter-vue/getting-started)
    // wouter-vue сам обработает base и корректно найдет маршрут
    const app = createSSRApp(() => h(App, { ssrPath: path, ssrSearch: search }));
    
    const html = await renderToString(app);
    
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}

