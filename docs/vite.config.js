import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import Markdown from 'vite-plugin-md';
import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { generateSearchIndex } from './src/utils/search-index.js';
import { generateMenu } from './src/utils/menu-generator.js';

/**
 * Vite plugin to generate menu structure and search index from Markdown files
 */
function generateMenuPlugin() {
  return {
    name: 'generate-menu',
    buildStart() {
      // Generate menu structure
      generateMenu(__dirname);
      console.log('✓ Menu structure generated');
      
      // Also generate search index
      const searchIndex = generateSearchIndex(__dirname);
      
      // Write search index as JS module for SSR compatibility
      const searchIndexJsPath = path.resolve(__dirname, './src/search-index.js');
      const searchIndexContent = `/**
 * Search index - auto-generated at build time
 * Contains all markdown pages for search functionality
 */
export default ${JSON.stringify(searchIndex, null, 2)};
`;
      fs.writeFileSync(searchIndexJsPath, searchIndexContent, 'utf-8');
      console.log('✓ Search index generated');
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/wouter-vue/' : '/',
  plugins: [
    generateMenuPlugin(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    tailwindcss(),
    Markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
              return `<pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>`;
            } catch (err) {
              console.warn('Highlight error:', err);
            }
          }
          return `<pre class="hljs"><code>${str.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        },
      },
      markdownItSetup(md) {
        // Custom fence renderer that creates wrapper for CodeBlock component
        const defaultFence = md.renderer.rules.fence;
        md.renderer.rules.fence = function(tokens, idx, options, env, self) {
          const token = tokens[idx];
          const info = token.info ? token.info.trim() : '';
          const langName = info.split(/\s+/g)[0];
          const code = token.content;
          
          // Escape code for HTML attribute (more robust escaping)
          const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          
          // Create wrapper div with data attributes for CodeBlock component
          // The CodeBlock component will be mounted here by Layout.vue
          return `<div class="code-block-mount" data-code="${escapedCode}" data-lang="${langName || ''}"></div>`;
        };
      },
      wrapperClasses: 'prose prose-slate dark:prose-invert max-w-none',
    }),
  ],
  optimizeDeps: {
    exclude: ['@vue/repl'],
  },
  server: {
    port: 5173,
    fs: {
      strict: false,
    },
  },
  ssr: {
    noExternal: ['wouter-vue'],
  },
  build: {
    rollupOptions: {
      input: {
        client: './index.html',
        server: './src/entry-server.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'server') {
            return 'server/[name].js';
          }
          return 'client/[name]-[hash].js';
        }
      }
    }
  }
});
