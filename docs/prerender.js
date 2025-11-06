import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

// Recursively extract all routes from menu structure
function extractRoutes(menuItems) {
  const routes = [];
  
  for (const item of menuItems) {
    if (item.isFile && item.path) {
      routes.push(item.path);
    }
    
    if (item.children && item.children.length > 0) {
      routes.push(...extractRoutes(item.children));
    }
  }
  
  return routes;
}

// Get all routes from menu.json
function getRoutesFromMenu() {
  try {
    const menuPath = toAbsolute('src/menu.json');
    const menuContent = fs.readFileSync(menuPath, 'utf-8');
    const menu = JSON.parse(menuContent);
    
    const routes = extractRoutes(menu.root || []);
    
    // Ensure root path is included
    if (!routes.includes('/')) {
      routes.unshift('/');
    }
    
    // Sort routes: root first, then alphabetical
    return routes.sort((a, b) => {
      if (a === '/') return -1;
      if (b === '/') return 1;
      return a.localeCompare(b);
    });
  } catch (error) {
    console.error('Error reading menu.json:', error);
    // Fallback to basic routes
    return ['/'];
  }
}

async function run() {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const basePath = isGitHubPages ? '/wouter-vue' : '';
  
  console.log(`Prerendering for ${isGitHubPages ? 'GitHub Pages' : 'local'}`);

  // Find entry-server.js file (Vite may output it with a hash in client subfolder)
  let entryServerPath = null;
  
  // Try dist/server/client/entry-server-*.js first (with hash)
  const serverClientDir = toAbsolute('dist/server/client');
  if (fs.existsSync(serverClientDir)) {
    const files = fs.readdirSync(serverClientDir);
    const entryFile = files.find(f => f.startsWith('entry-server') && f.endsWith('.js'));
    if (entryFile) {
      entryServerPath = path.join(serverClientDir, entryFile);
    }
  }
  
  // Fallback: try dist/server/entry-server.js (without hash)
  if (!entryServerPath) {
    const directPath = toAbsolute('dist/server/entry-server.js');
    if (fs.existsSync(directPath)) {
      entryServerPath = directPath;
    }
  }
  
  if (!entryServerPath) {
    throw new Error(`Could not find entry-server.js. Checked:
- ${toAbsolute('dist/server/client/')}
- ${toAbsolute('dist/server/')}`);
  }
  
  console.log(`Found entry-server at: ${entryServerPath}`);
  
  // Import the SSR render function
  const { render } = await import(pathToFileURL(entryServerPath).href);
  
  // Ensure dist/client exists
  const distPath = toAbsolute('dist/client');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Read the template
  const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8');

  // Get all routes from menu.json
  const routesToPrerender = getRoutesFromMenu();
  
  console.log(`Found ${routesToPrerender.length} routes to prerender`);

  // Render each route
  for (const routePath of routesToPrerender) {
    try {
      // Form full URL for rendering (simulates real GitHub Pages request)
      const urlToRender = `${basePath}${routePath}`.replace(/\/+/g, '/');
      console.log(`Rendering URL: ${urlToRender}`);
      
      const appHtml = await render(urlToRender);
      
      // File path should be relative to dist/client (without base path)
      const filePath = routePath.endsWith('/') 
        ? path.join(routePath, 'index.html')
        : path.join(routePath, 'index.html');
      
      const fullPath = path.join(distPath, filePath);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const html = template.replace(/<!--ssr-outlet-->/, appHtml);
      
      fs.writeFileSync(fullPath, html);
      console.log(`✓ Prerendered: ${urlToRender} -> ${fullPath.replace(__dirname, '')}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${routePath}:`, error);
      throw error; // Re-throw to fail the build
    }
  }

  // Generate 404.html for GitHub Pages
  if (isGitHubPages) {
    try {
      const notFoundHtml = template.replace(/<!--ssr-outlet-->/, await render('/404'));
      fs.writeFileSync(path.join(distPath, '404.html'), notFoundHtml);
      console.log('✓ Prerendered: /404.html');
    } catch (error) {
      console.warn('⚠ Failed to prerender 404.html:', error);
    }
  }
  
  console.log('\n✓ Prerendering complete!');
}

run().catch((error) => {
  console.error('Prerendering failed:', error);
  process.exit(1);
});
