import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';
import router from './router';

export async function render(url) {
  try {
    const app = createSSRApp(App);
    app.use(router);
    
    // Normalize URL for server routing: drop hash, keep path + query
    let target = url || '/';
    if (typeof url === 'string') {
      // strip hash fragment (not used on server)
      const hashIdx = url.indexOf('#');
      if (hashIdx >= 0) target = url.slice(0, hashIdx);
    }

    // Set the router location on the server
    await router.push(target);
    await router.isReady();
    
    const html = await renderToString(app);
    return html || '<div>No content rendered</div>';
  } catch (error) {
    console.error('[SSR Render Error]', error);
    throw error;
  }
}


