<template>
  <div class="page" data-testid="about-page">
    <h1>About</h1>
    <p class="intro">This is a demo of <strong>wouter-vue</strong> router for Vue 3.</p>
    
    <div class="features-box">
      <h2>Features</h2>
      <ul>
        <li>✅ Route matching with parameters</li>
        <li>✅ Nested routes support</li>
        <li>✅ Async component loading with Suspense</li>
        <li>✅ Programmatic navigation</li>
        <li>✅ Active link detection</li>
        <li>✅ Server-Side Rendering (SSR) support</li>
        <li>✅ Tiny bundle size (~2KB gzipped)</li>
      </ul>
    </div>
    
    <div class="tech-box">
      <h2>Technology</h2>
      <p>Built with modern Vue 3 Composition API for a reactive and flexible routing experience.</p>
      <p>The router is lightweight, fast, and easy to integrate into any Vue 3 project.</p>
    </div>
    
    <div class="url-info-box">
      <h2>URL Information</h2>
      <div class="info-item">
        <strong>Path:</strong> <code>{{ location }}</code>
      </div>
      <div class="info-item">
        <strong>Full Path:</strong> <code>{{ fullPath }}</code>
      </div>
      <div class="info-item" v-if="Object.keys(queryParams).length > 0">
        <strong>Query Parameters:</strong>
        <pre>{{ JSON.stringify(queryParams, null, 2) }}</pre>
      </div>
      <div class="info-item" v-else>
        <strong>Query Parameters:</strong> <em>None</em>
      </div>
      <div class="info-item" v-if="hash">
        <strong>Hash:</strong> <code>{{ hash }}</code>
      </div>
      <div class="info-item" v-else>
        <strong>Hash:</strong> <em>None</em>
      </div>
      <div class="info-hint">
        💡 Try adding query parameters and hash to the URL, for example:<br>
        <code>/about?page=2&sort=asc#section-1</code>
      </div>
    </div>
    
    <div class="nav-box">
      <Link href="/">← Back to Home</Link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Link, useLocation, useSearchParams, useSearch } from 'wouter-vue';

const [location] = useLocation();
const [searchParams] = useSearchParams();
const search = useSearch();

// Parse query parameters
// Accessing location.value in computed makes it reactive to location changes
const queryParams = computed(() => {
  const params = {};
  
  // Access location to make computed reactive to location changes
  location.value;
  
  // Primary source: window.location.search (most reliable, reads fresh value each time)
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    if (Object.keys(params).length > 0) return params;
  }
  
  // Fallback: try searchParams from wouter-vue
  if (searchParams.value && searchParams.value.size > 0) {
    searchParams.value.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }
  
  // Fallback: try search.value if available
  if (search.value) {
    try {
      // search.value is already sanitized (without ?), URLSearchParams accepts it directly
      const urlParams = new URLSearchParams(search.value);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
      if (Object.keys(params).length > 0) return params;
    } catch (e) {
      // If that fails, try with ? prefix
      try {
        const urlParams = new URLSearchParams(`?${search.value}`);
        urlParams.forEach((value, key) => {
          params[key] = value;
        });
      } catch (e2) {
        // Silent fail
      }
    }
  }
  
  return params;
});

// Get hash from browser location
const hash = computed(() => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hash || '';
  }
  return '';
});

// Construct full path
const fullPath = computed(() => {
  let path = location.value || '';
  const searchStr = searchParams.value && searchParams.value.toString();
  if (searchStr) {
    path += `?${searchStr}`;
  } else if (search.value) {
    // Fallback to search.value
    const searchString = search.value.startsWith('?') ? search.value : `?${search.value}`;
    path += searchString;
  }
  if (hash.value) {
    path += hash.value;
  }
  return path;
});
</script>

<style scoped>
.page {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.intro {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

strong {
  color: #4f46e5;
}

h2 {
  color: #334155;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.features-box,
.tech-box,
.url-info-box {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.features-box ul {
  list-style: none;
  padding: 0;
}

.features-box li {
  padding: 0.5rem 0;
  font-size: 1rem;
  color: #475569;
}

.nav-box {
  margin-top: 2rem;
}

.nav-box a {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-box a:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.url-info-box code {
  background: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #1e293b;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.url-info-box .info-item {
  margin: 1rem 0;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #4f46e5;
}

.url-info-box strong {
  display: block;
  color: #334155;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.url-info-box pre {
  background: #1e293b;
  color: #f1f5f9;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.url-info-box em {
  color: #94a3b8;
  font-style: italic;
}

.url-info-box .info-hint {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.9rem;
  line-height: 1.6;
}

.url-info-box .info-hint code {
  background: #fbbf24;
  color: #78350f;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.85em;
}
</style>

