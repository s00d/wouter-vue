<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="search-modal-overlay"
        @click.self="close"
      >
        <!-- Modal -->
        <Transition name="slide-down">
          <div v-if="isOpen" class="search-modal" @click.stop>
            <!-- Header -->
            <div class="search-modal-header">
              <div class="search-input-container">
                <svg
                  class="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search documentation..."
                  class="search-input"
                  @keydown.esc="close"
                  @keydown.enter.prevent="handleEnter"
                  @keydown.down.prevent="navigateResults(1)"
                  @keydown.up.prevent="navigateResults(-1)"
                />
                <button
                  @click="close"
                  class="close-button"
                  aria-label="Close search"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-if="searchQuery && !isLoading" class="search-stats">
                {{ groupedResults.reduce((sum, group) => sum + group.items.length, 0) }} {{ groupedResults.reduce((sum, group) => sum + group.items.length, 0) === 1 ? 'result' : 'results' }}
              </div>
            </div>

            <!-- Content -->
            <div class="search-modal-content">
              <div v-if="isLoading" class="empty-state">
                <p class="text-gray-500">Loading...</p>
              </div>

              <div v-else-if="!searchQuery" class="empty-state">
                <p class="text-gray-500">Type to search documentation</p>
              </div>

              <div v-else-if="filteredResults.length === 0" class="empty-state">
                <p class="text-gray-500">No results found</p>
              </div>

              <div v-else class="results-list">
                <div v-for="group in groupedResults" :key="group.name" class="result-group">
                  <h3 class="group-title">{{ group.name }}</h3>
                  <div
                    v-for="(result, index) in group.items"
                    :key="result.path"
                    @click="navigateToPage(result.path)"
                    @mouseenter="selectedIndex = getGlobalIndex(group.name, index)"
                    class="result-item"
                    :class="{ 'selected': selectedIndex === getGlobalIndex(group.name, index) }"
                  >
                    <div class="result-header">
                      <Link :href="result.path" class="result-title" v-html="highlightTitle(result.title, searchQuery)"></Link>
                      <span class="result-path">{{ result.path }}</span>
                    </div>
                    <div class="result-content" v-html="result.highlightedContent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { Link, useLocation } from 'wouter-vue';
import { Teleport } from 'vue';
import MiniSearch from 'minisearch';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const [location, navigate] = useLocation();
const searchQuery = ref('');
const documents = ref([]);
const miniSearch = ref(null);
const isLoading = ref(true);
const selectedIndex = ref(-1);
const searchInputRef = ref(null);

// Load search index
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Import search index JS module (works in SSR)
    const searchIndexModule = await import('../search-index.js');
    const indexData = searchIndexModule.default || { documents: [], index: null };
    
    documents.value = indexData.documents || [];
    
    // Initialize MiniSearch from serialized index
    if (indexData.index) {
      // MiniSearch.loadJSON expects a JSON string, but we have an object
      // So we need to serialize it first
      const indexString = typeof indexData.index === 'string' 
        ? indexData.index 
        : JSON.stringify(indexData.index);
      
      miniSearch.value = MiniSearch.loadJSON(indexString, {
        fields: ['title', 'content'],
        storeFields: ['path', 'title', 'content'],
        searchOptions: {
          boost: { title: 2 },
          fuzzy: 0.2,
          prefix: true,
        },
      });
    } else {
      // Fallback: create new index if not serialized
      miniSearch.value = new MiniSearch({
        fields: ['title', 'content'],
        storeFields: ['path', 'title', 'content'],
        searchOptions: {
          boost: { title: 2 },
          fuzzy: 0.2,
          prefix: true,
        },
      });
      miniSearch.value.addAll(documents.value);
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading search index:', error);
    isLoading.value = false;
  }
});

// Focus input when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInputRef.value?.focus();
      searchQuery.value = '';
      selectedIndex.value = -1;
    });
  }
});

// Highlight search matches in text (supports multiple words)
function highlightText(text, query) {
  if (!query || !text) return text;
  
  const queryWords = query.split(/\s+/).filter(w => w.length > 1);
  
  if (queryWords.length === 0) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  }
  
  // Create combined regex for all words
  const combinedPattern = queryWords.map(w => escapeRegex(w)).join('|');
  const regex = new RegExp(`(${combinedPattern})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Extract snippet around match
function extractSnippet(text, query, maxLength = 200) {
  if (!query || !text) return text.substring(0, maxLength);
  
  const queryWords = query.split(/\s+/).filter(w => w.length > 1);
  const searchTerm = queryWords.length > 0 ? queryWords[0] : query;
  
  const firstMatchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  
  if (firstMatchIndex === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }
  
  const start = Math.max(0, firstMatchIndex - 50);
  const end = Math.min(text.length, firstMatchIndex + searchTerm.length + 150);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}

// Perform search using MiniSearch
const filteredResults = computed(() => {
  if (!searchQuery.value.trim() || !miniSearch.value) {
    return [];
  }
  
  const query = searchQuery.value.trim();
  
  try {
    // Use MiniSearch for intelligent search
    const searchResults = miniSearch.value.search(query);
    
    // Map results and add highlighting
    return searchResults.map((result) => {
      const doc = result;
      const snippet = extractSnippet(doc.content, query);
      const highlightedSnippet = highlightText(snippet, query);
      
      return {
        path: doc.path,
        title: doc.title,
        content: snippet,
        highlightedContent: highlightedSnippet,
        score: result.score || 0,
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
});

// Group results by section (first path segment)
const groupedResults = computed(() => {
  const groups = new Map();
  
  filteredResults.value.forEach(result => {
    // Extract section from path (e.g., /api/composables/use-location -> 'api')
    const pathParts = result.path.split('/').filter(Boolean);
    const section = pathParts.length > 0 ? pathParts[0] : 'other';
    
    // Map section names to display names
    const sectionNames = {
      'api': 'API Reference',
      'guides': 'Guides',
      'cookbook': 'Cookbook',
      'getting-started': 'Introduction',
      'installation': 'Introduction',
      'core-concepts': 'Introduction',
      'other': 'Other',
    };
    
    const sectionName = sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
    
    if (!groups.has(sectionName)) {
      groups.set(sectionName, []);
    }
    groups.get(sectionName).push(result);
  });
  
  // Convert to array and sort by section order
  const sectionOrder = ['Introduction', 'Guides', 'API Reference', 'Cookbook', 'Other'];
  return Array.from(groups.entries())
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => (b.score || 0) - (a.score || 0)), // Sort by relevance within group
    }))
    .sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.name);
      const bIndex = sectionOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
});

// Highlight title text (similar to highlightText but for titles)
function highlightTitle(title, query) {
  if (!query || !title) return title;
  
  const queryWords = query.split(/\s+/).filter(w => w.length > 1);
  
  if (queryWords.length === 0) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return title.replace(regex, '<mark class="highlight">$1</mark>');
  }
  
  // Create combined regex for all words
  const combinedPattern = queryWords.map(w => escapeRegex(w)).join('|');
  const regex = new RegExp(`(${combinedPattern})`, 'gi');
  return title.replace(regex, '<mark class="highlight">$1</mark>');
}

function navigateToPage(path) {
  close();
  navigate(path);
}

function close() {
  emit('close');
}

function handleEnter() {
  if (selectedIndex.value >= 0) {
    // Find the result at the selected index across all groups
    let currentIndex = 0;
    for (const group of groupedResults.value) {
      for (const result of group.items) {
        if (currentIndex === selectedIndex.value) {
          navigateToPage(result.path);
          return;
        }
        currentIndex++;
      }
    }
  } else if (groupedResults.value.length > 0 && groupedResults.value[0].items.length > 0) {
    navigateToPage(groupedResults.value[0].items[0].path);
  }
}

function navigateResults(direction) {
  const totalResults = groupedResults.value.reduce((sum, group) => sum + group.items.length, 0);
  const maxIndex = totalResults - 1;
  selectedIndex.value = Math.max(-1, Math.min(maxIndex, selectedIndex.value + direction));
}

// Get global index for a result within a group
function getGlobalIndex(groupName, itemIndex) {
  let globalIndex = 0;
  for (const group of groupedResults.value) {
    if (group.name === groupName) {
      return globalIndex + itemIndex;
    }
    globalIndex += group.items.length;
  }
  return -1;
}
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:global(.dark) .search-modal {
  background: #1f2937;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.search-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

:global(.dark) .search-modal-header {
  border-bottom-color: #374151;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  flex: 1;
  padding: 0.75rem 3rem 0.75rem 3rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
  background: white;
  color: #1f2937;
}

:global(.dark) .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:global(.dark) .search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.close-button {
  padding: 0.5rem;
  color: #6b7280;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

:global(.dark) .close-button {
  color: #9ca3af;
}

.close-button:hover {
  background-color: #f3f4f6;
}

:global(.dark) .close-button:hover {
  background-color: #374151;
}

.search-stats {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

:global(.dark) .search-stats {
  color: #9ca3af;
}

.search-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

:global(.dark) .empty-state {
  color: #6b7280;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.25rem;
  padding: 0 0.5rem;
}

:global(.dark) .group-title {
  color: #9ca3af;
}

.result-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .result-item {
  background: #374151;
  border-color: #4b5563;
}

.result-item:hover,
.result-item.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:global(.dark) .result-item:hover,
:global(.dark) .result-item.selected {
  border-color: #60a5fa;
  background-color: #1e3a8a;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-decoration: none;
}

:global(.dark) .result-title {
  color: #f9fafb;
}

.result-title:hover {
  color: #3b82f6;
}

:global(.dark) .result-title:hover {
  color: #60a5fa;
}

.result-path {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

:global(.dark) .result-path {
  color: #9ca3af;
}

.result-content {
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.875rem;
}

:global(.dark) .result-content {
  color: #d1d5db;
}

.result-content :deep(.highlight) {
  background-color: #fef3c7;
  padding: 0;
  border-radius: 0.125rem;
  font-weight: 600;
  color: #92400e;
}

:global(.dark) .result-content :deep(.highlight) {
  background-color: #78350f;
  color: #fbbf24;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>

