import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;

async function createServer() {
  const app = express();
  
  let vite;
  if (!isProduction) {
    // Create Vite server in middleware mode
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist/client'), {
      index: false
    }));
  }

  // Vite middleware should be FIRST - handles static assets, JS, CSS, etc
  if (!isProduction && vite) {
    app.use(vite.middlewares);
  }

  // SSR handler - should handle HTML requests AFTER vite middleware
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip non-HTML requests - let Vite handle them
    if (!isProduction && (!req.headers.accept || !req.headers.accept.includes('text/html'))) {
      return next();
    }

    try {
      let template;
      let render;

      if (!isProduction) {
        // Read index.html from dev
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        const serverEntry = await vite.ssrLoadModule('/src/entry-server.js');
        render = serverEntry.render;
      } else {
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        );
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const appHtml = await render(url);

      const html = template.replace(/<!--ssr-outlet-->/, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('[SSR Error]', e);
      res.status(500).end(e.message);
    }
  });

  return app;
}

createServer().then((app) => {
  app.listen(port, () => {
    console.log(`SSR Server is running at http://localhost:${port}`);
  });
});

