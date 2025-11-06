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
          section: frontmatter.section || null,
          order: frontmatter.order !== undefined ? frontmatter.order : 999,
          parts: url.split('/').filter(Boolean),
        });
      }
    }
  }
  
  scanDirectory(contentDir);
  
  // Map section names to display names and order
  const sectionDisplayNames = {
    'Introduction': 'Introduction',
    'Guides': 'Guides',
    'API Reference': 'API Reference',
    'Cookbook': 'Cookbook',
    'Other': 'Other',
  };
  
  const sectionOrder = ['Introduction', 'Guides', 'API Reference', 'Cookbook', 'Other'];
  
  // Organize into sections based on frontmatter
  const sections = new Map();
  
  // Helper function to determine section from file
  function getSectionForFile(file) {
    // If section is explicitly set in frontmatter, use it
    if (file.section) {
      return file.section;
    }
    
    // Fallback: determine section from path structure
    if (file.parts.length > 1) {
      const firstPart = file.parts[0];
      const sectionMap = {
        'api': 'API Reference',
        'guides': 'Guides',
        'cookbook': 'Cookbook',
      };
      return sectionMap[firstPart] || 'Other';
    }
    
    // Root-level files default to "Other" if no section specified
    return 'Other';
  }
  
  // Group files by section
  files.forEach(file => {
    const sectionName = getSectionForFile(file);
    
    if (!sections.has(sectionName)) {
      sections.set(sectionName, {
        title: sectionDisplayNames[sectionName] || sectionName,
        files: [],
        children: new Map(),
      });
    }
    
    sections.get(sectionName).files.push(file);
  });
  
  // Process files within each section
  sections.forEach((section, sectionName) => {
    // Sort files by order, then alphabetically
    section.files.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.title.localeCompare(b.title);
    });
    
    // Build nested structure for files in this section
    section.files.forEach(file => {
      // For nested files (e.g., /api/composables/use-location)
      if (file.parts.length > 1) {
        const sectionPart = file.parts[0];
        let current = section.children;
        
        // Build nested structure starting from second part
        for (let i = 1; i < file.parts.length; i++) {
          const part = file.parts[i];
          const isLast = i === file.parts.length - 1;
          const fullPath = '/' + file.parts.slice(0, i + 1).join('/');
          
          if (!current.has(part)) {
            current.set(part, {
              path: fullPath,
              title: isLast ? file.title : formatTitle(part),
              order: file.order,
              children: new Map(),
              isFile: isLast,
            });
          } else if (isLast) {
            // Update title and order if frontmatter has it
            const existing = current.get(part);
            existing.title = file.title;
            existing.order = file.order;
          }
          
          if (!isLast) {
            current = current.get(part).children;
          }
        }
      } else {
        // Root-level files in section
        const fileName = file.parts[0];
        if (!section.children.has(fileName)) {
          section.children.set(fileName, {
            path: file.path,
            title: file.title,
            order: file.order,
            children: [],
            isFile: true,
          });
        }
      }
    });
  });
  
  // Convert Map to Array structure with sorting
  function mapToArray(map) {
    return Array.from(map.values())
      .map(item => ({
        ...item,
        children: item.children.size > 0 ? mapToArray(item.children) : [],
      }))
      .sort((a, b) => {
        // Sort by order if available, then by type (folders first), then alphabetically
        if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
          return a.order - b.order;
        }
        if (a.isFile && !b.isFile) return 1;
        if (!a.isFile && b.isFile) return -1;
        return a.title.localeCompare(b.title);
      });
  }
  
  // Build final structure
  const root = [];
  
  // Add sections in predefined order
  sectionOrder.forEach(sectionName => {
    const section = sections.get(sectionName);
    if (section && section.children.size > 0) {
      // Determine path for section (use first child's path parent or default)
      let sectionPath = '/';
      const firstChild = Array.from(section.children.values())[0];
      if (firstChild && firstChild.path) {
        const pathParts = firstChild.path.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          sectionPath = `/${pathParts[0]}`;
        }
      }
      
      root.push({
        path: sectionPath,
        title: section.title,
        children: mapToArray(section.children),
        isFile: false,
      });
    }
  });
  
  // Add any remaining sections not in predefined order
  sections.forEach((section, sectionName) => {
    if (!sectionOrder.includes(sectionName) && section.children.size > 0) {
      let sectionPath = '/';
      const firstChild = Array.from(section.children.values())[0];
      if (firstChild && firstChild.path) {
        const pathParts = firstChild.path.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          sectionPath = `/${pathParts[0]}`;
        }
      }
      
      root.push({
        path: sectionPath,
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

