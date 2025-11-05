import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  // Find entry-server.js file (it has a hash in the name and is in client subfolder)
  const serverDir = toAbsolute('dist/server/client');
  let entryServerPath = null;
  
  if (fs.existsSync(serverDir)) {
    const files = fs.readdirSync(serverDir);
    const entryFile = files.find(f => f.startsWith('entry-server') && f.endsWith('.js'));
    if (entryFile) {
      entryServerPath = path.resolve(serverDir, entryFile);
    }
  }
  
  // Fallback: try direct path
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
  // entryServerPath is already absolute, convert to file:// URL
  const entryServerUrl = path.isAbsolute(entryServerPath)
    ? `file://${entryServerPath}`
    : `file://${path.resolve(entryServerPath)}`;
  
  const { render } = await import(entryServerUrl);
  
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
  for (const url of routesToPrerender) {
    try {
      const appHtml = await render(url);
      
      const filePath = url.endsWith('/') 
        ? `${url}index.html` 
        : `${url}/index.html`;
      
      const fullPath = path.join(distPath, filePath);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const html = template.replace(/<!--ssr-outlet-->/, appHtml);
      
      fs.writeFileSync(fullPath, html);
      console.log(`✓ Prerendered: ${url}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${url}:`, error);
    }
  }
  
  console.log('\n✓ Prerendering complete!');
}

run().catch((error) => {
  console.error('Prerendering failed:', error);
  process.exit(1);
});
