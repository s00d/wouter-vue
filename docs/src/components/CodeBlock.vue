<template>
  <div class="code-block-wrapper">
    <div class="copy-button-container">
      <CopyButton :code="code" />
    </div>
    <pre :class="['hljs', `language-${lang}`]"><code :class="`language-${lang}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import hljs from 'highlight.js';
import CopyButton from './CopyButton.vue';

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: ''
  }
});

const highlightedCode = computed(() => {
  if (props.lang && hljs.getLanguage(props.lang)) {
    try {
      return hljs.highlight(props.code, { language: props.lang, ignoreIllegals: true }).value;
    } catch (err) {
      console.warn('Highlight error:', err);
      return escapeHtml(props.code);
    }
  }
  
  // Try auto-detection
  try {
    return hljs.highlightAuto(props.code).value;
  } catch (err) {
    return escapeHtml(props.code);
  }
});

function escapeHtml(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
}

.copy-button-container {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

pre {
  position: relative;
}
</style>

