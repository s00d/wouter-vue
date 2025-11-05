/**
 * Automatic route generation from Markdown files
 * Scans src/content/**\/*.md and generates routes
 */

export function createRoutes() {
  // Use Vite's import.meta.glob to get all Markdown files
  // For SSR, we'll use eager loading via separate entry point
  // For browser, use lazy loading
  // Vite requires static options, so we use eager: false for client bundle
  // and handle SSR eager loading in the SSR entry point
  const pages = import.meta.glob('./content/**/*.md', { 
    eager: false 
  });

  const routes = [];
  for (const path in pages) {
    // Convert file path to URL
    // './content/index.md' -> '/'
    // './content/getting-started.md' -> '/getting-started'
    // './content/api/composables/use-location.md' -> '/api/composables/use-location'

    let url = path
      .replace('./content/', '')
      .replace('.md', '')
      .toLowerCase();

    // Handle index.md specially
    if (url === 'index') {
      url = '/';
    } else {
      url = '/' + url;
    }

    routes.push({
      path: url,
      component: pages[path], // Async import function
    });
  }

  // Sort routes: index first, then alphabetical
  routes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });

  return routes;
}


