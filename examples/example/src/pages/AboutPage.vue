<template>
  <div class="page" data-testid="about-page">
    <h1>{{ data?.pageName || 'About' }}</h1>
    <p class="intro">This is a demo of <strong>wouter-vue</strong> router for Vue 3.</p>
    
    <!-- Route Data Display -->
    <div class="route-data-box" v-if="hasRouteData">
      <h2>Route Data</h2>
      <p class="data-description">
        This page demonstrates hierarchical data passing from <code>&lt;AnimatedSwitch&gt;</code> and <code>&lt;Route&gt;</code> components.
      </p>
      <div class="data-item">
        <strong>Theme:</strong> <span class="data-value">{{ routeData.theme || 'not set' }}</span>
      </div>
      <div class="data-item">
        <strong>Layout:</strong> <span class="data-value">{{ routeData.layout || 'not set' }}</span>
      </div>
      <div class="data-item" v-if="routeData.pageName">
        <strong>Page Name:</strong> <span class="data-value">{{ routeData.pageName }}</span>
      </div>
      <div class="data-item" v-if="routeData.version">
        <strong>Version:</strong> <span class="data-value">{{ routeData.version }}</span>
      </div>
      <div class="data-hint">
        💡 Data is passed reactively from parent routes. Check <code>AppRoutes.vue</code> to see how data flows hierarchically.
      </div>
    </div>
    
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
        <li>✅ Hierarchical data passing</li>
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
import { Link, useLocation, useSearchParams, useRouteData } from 'wouter-vue';

// Access route data via props (for :component prop)
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  params: {
    type: Object,
    default: () => ({})
    // params contains route parameters extracted from URL path
    // Example: for route "/users/:id" and URL "/users/123", params = { id: '123' }
    // For route "/about" (no dynamic params), params = {}
    // Use useParams() composable for alternative access method
  }
});

// Access route data via composable (alternative method)
const routeData = useRouteData();

const [location] = useLocation();
const [searchParams] = useSearchParams();

// Check if route data is available
const hasRouteData = computed(() => {
  return Object.keys(routeData.value).length > 0 || (props.data && Object.keys(props.data).length > 0);
});

// Parse query parameters using useSearchParams
const queryParams = computed(() => {
  const params = {};
  if (searchParams.value && searchParams.value.size > 0) {
    searchParams.value.forEach((value, key) => {
      params[key] = value;
    });
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

.route-data-box,
.features-box,
.tech-box,
.url-info-box {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.route-data-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.route-data-box h2 {
  color: white;
}

.route-data-box .data-description {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.route-data-box code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.route-data-box .data-item {
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.route-data-box .data-item strong {
  color: rgba(255, 255, 255, 0.95);
  display: inline-block;
  min-width: 120px;
}

.route-data-box .data-value {
  color: #fbbf24;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.route-data-box .data-hint {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-left: 4px solid #fbbf24;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.6;
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

