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
                {{ filteredResults.length }} {{ filteredResults.length === 1 ? 'result' : 'results' }}
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
                <div
                  v-for="(result, index) in filteredResults"
                  :key="result.path"
                  @click="navigateToPage(result.path)"
                  @mouseenter="selectedIndex = index"
                  class="result-item"
                  :class="{ 'selected': selectedIndex === index }"
                >
                  <div class="result-header">
                    <Link :href="result.path" class="result-title">
                      {{ result.title }}
                    </Link>
                    <span class="result-path">{{ result.path }}</span>
                  </div>
                  <div class="result-content" v-html="result.highlightedContent"></div>
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

function navigateToPage(path) {
  close();
  navigate(path);
}

function close() {
  emit('close');
}

function handleEnter() {
  if (selectedIndex.value >= 0 && selectedIndex.value < filteredResults.value.length) {
    navigateToPage(filteredResults.value[selectedIndex.value].path);
  } else if (filteredResults.value.length > 0) {
    navigateToPage(filteredResults.value[0].path);
  }
}

function navigateResults(direction) {
  const maxIndex = filteredResults.value.length - 1;
  selectedIndex.value = Math.max(-1, Math.min(maxIndex, selectedIndex.value + direction));
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

.search-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.close-button:hover {
  background-color: #f3f4f6;
}

.search-stats {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
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

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover,
.result-item.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

.result-title:hover {
  color: #3b82f6;
}

.result-path {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.result-content {
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.875rem;
}

.result-content :deep(.highlight) {
  background-color: #fef3c7;
  padding: 0;
  border-radius: 0.125rem;
  font-weight: 600;
  color: #92400e;
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

