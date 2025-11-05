/**
 * Menu generator - creates menu structure from Markdown files
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function generateMenu(baseDir) {
  const contentDir = path.resolve(baseDir, './src/content');
  const menuPath = path.resolve(baseDir, './src/menu.json');
  
  function formatTitle(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  function readFileFrontmatter(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(fileContent);
      return parsed.data || {};
    } catch (err) {
      return {};
    }
  }
  
  // Collect all markdown files with their paths and frontmatter
  const files = [];
  
  function scanDirectory(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        const frontmatter = readFileFrontmatter(fullPath);
        const url = relativePath.replace('.md', '').toLowerCase();
        
        files.push({
          path: `/${url}`,
          filePath: relativePath,
          title: frontmatter.title || formatTitle(entry.name.replace('.md', '')),
          parts: url.split('/').filter(Boolean),
        });
      }
    }
  }
  
  scanDirectory(contentDir);
  
  // Organize into sections
  const sections = new Map();
  const sectionOrder = ['getting-started', 'api', 'guides', 'cookbook'];
  
  // Process root-level files first
  const rootFiles = files.filter(f => f.parts.length === 1);
  const rootFileMapping = {
    'getting-started': 'getting-started',
    'installation': 'getting-started',
    'core-concepts': 'getting-started',
    'server-side-rendering': 'other',
    'performance': 'other',
    'typescript': 'other',
    'migration': 'other',
    'troubleshooting': 'other',
    'contributing': 'other',
  };
  
  // Initialize sections
  sectionOrder.forEach(sectionName => {
    sections.set(sectionName, {
      path: sectionName === 'getting-started' ? '/' : `/${sectionName}`,
      title: formatTitle(sectionName),
      children: new Map(),
      isFile: false,
    });
  });
  
  sections.set('other', {
    path: '/other',
    title: 'Other',
    children: new Map(),
    isFile: false,
  });
  
  // Add root-level files to appropriate sections
  rootFiles.forEach(file => {
    const fileName = file.parts[0];
    const sectionName = rootFileMapping[fileName] || 'other';
    const section = sections.get(sectionName);
    
    if (section && !section.children.has(fileName)) {
      section.children.set(fileName, {
        path: file.path,
        title: file.title,
        children: [],
        isFile: true,
      });
    }
  });
  
  // Process nested files
  const nestedFiles = files.filter(f => f.parts.length > 1);
  
  nestedFiles.forEach(file => {
    const sectionName = file.parts[0];
    let section = sections.get(sectionName);
    
    if (!section) {
      section = {
        path: `/${sectionName}`,
        title: formatTitle(sectionName),
        children: new Map(),
        isFile: false,
      };
      sections.set(sectionName, section);
    }
    
    // Build nested structure
    let current = section.children;
    
    for (let i = 1; i < file.parts.length; i++) {
      const part = file.parts[i];
      const isLast = i === file.parts.length - 1;
      const fullPath = '/' + file.parts.slice(0, i + 1).join('/');
      
      if (!current.has(part)) {
        current.set(part, {
          path: fullPath,
          title: isLast ? file.title : formatTitle(part),
          children: new Map(),
          isFile: isLast,
        });
      } else if (isLast) {
        // Update title if frontmatter has it
        current.get(part).title = file.title;
      }
      
      if (!isLast) {
        current = current.get(part).children;
      }
    }
  });
  
  // Convert Map to Array structure
  function mapToArray(map) {
    return Array.from(map.values())
      .map(item => ({
        ...item,
        children: item.children.size > 0 ? mapToArray(item.children) : [],
      }))
      .sort((a, b) => {
        if (a.isFile && !b.isFile) return 1;
        if (!a.isFile && b.isFile) return -1;
        return a.title.localeCompare(b.title);
      });
  }
  
  // Build final structure
  const root = [];
  
  // Add sections in order
  sectionOrder.forEach(sectionName => {
    const section = sections.get(sectionName);
    if (section && section.children.size > 0) {
      root.push({
        path: section.path,
        title: section.title,
        children: mapToArray(section.children),
        isFile: false,
      });
    }
  });
  
  // Add other sections
  sections.forEach((section, key) => {
    if (!sectionOrder.includes(key) && section.children.size > 0) {
      root.push({
        path: section.path,
        title: section.title,
        children: mapToArray(section.children),
        isFile: false,
      });
    }
  });
  
  const menuStructure = { root };
  
  // Ensure directory exists
  const menuDir = path.dirname(menuPath);
  if (!fs.existsSync(menuDir)) {
    fs.mkdirSync(menuDir, { recursive: true });
  }
  
  fs.writeFileSync(menuPath, JSON.stringify(menuStructure, null, 2), 'utf-8');
  
  return menuStructure;
}

