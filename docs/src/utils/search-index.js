/**
 * Search index generator - creates search index from markdown files
 * Uses minisearch for intelligent full-text search
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import MiniSearch from 'minisearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSearchIndex(baseDir) {
  // Use baseDir from vite.config.js, or fallback to __dirname
  const rootDir = baseDir || __dirname;
  const contentDir = path.resolve(rootDir, './src/content');
  const indexPath = path.resolve(rootDir, './src/search-index.json');
  
  const documents = [];
  
  function scanDirectory(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf-8');
          const parsed = matter(fileContent);
          
          // Get URL from path
          let url = relativePath.replace('.md', '').toLowerCase();
          if (url === 'index') {
            url = '/';
          } else {
            url = '/' + url;
          }
          
          const title = parsed.data.title || url.split('/').pop() || 'Home';
          
          // Extract text content (remove frontmatter and markdown syntax)
          const textContent = parsed.content
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, '') // Remove inline code
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
            .replace(/[#*_~]/g, '') // Remove markdown formatting
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim();
          
          documents.push({
            id: url,
            path: url,
            title,
            content: textContent,
          });
        } catch (err) {
          console.warn('Error processing file for search index:', fullPath, err);
        }
      }
    }
  }
  
  scanDirectory(contentDir);
  
  // Create minisearch index
  const miniSearch = new MiniSearch({
    fields: ['title', 'content'],
    storeFields: ['path', 'title', 'content'],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  });
  
  miniSearch.addAll(documents);
  
  // Serialize index for client-side usage
  // toJSON() returns a plain object (not a string), so we can use it directly
  const serializedIndex = miniSearch.toJSON();
  
  const indexData = {
    documents,
    index: serializedIndex, // Store as plain object, will be serialized by JSON.stringify
  };
  
  // Ensure directory exists
  const indexDir = path.dirname(indexPath);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  
  return indexData;
}

