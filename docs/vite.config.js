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
        // Ensure code blocks are always rendered as code, not Vue components
        const defaultFence = md.renderer.rules.fence;
        md.renderer.rules.fence = function(tokens, idx, options, env, self) {
          const token = tokens[idx];
          const info = token.info ? token.info.trim() : '';
          const langName = info.split(/\s+/g)[0];
          
          // Always render code blocks as HTML, never as Vue components
          if (langName === 'vue') {
            // For vue code blocks, render as highlighted code using html/js syntax
            // highlight.js doesn't have 'vue' language, so we use 'html' or 'javascript'
            let highlighted;
            try {
              // Try html first (vue templates are similar to HTML)
              if (hljs.getLanguage('html')) {
                highlighted = hljs.highlight(token.content, { language: 'html', ignoreIllegals: true }).value;
              } else {
                // Fallback to plain text if html is not available
                highlighted = hljs.highlight(token.content, { language: 'plaintext', ignoreIllegals: true }).value;
              }
            } catch (err) {
              // Fallback: escape HTML and render as plain text
              highlighted = token.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            return `<pre class="hljs"><code class="language-vue">${highlighted}</code></pre>`;
          }
          
          // Use default fence renderer for other languages
          return defaultFence ? defaultFence(tokens, idx, options, env, self) : '';
        };
      },
      wrapperClasses: 'max-w-none',
    }),
  ],
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
