<template>
  <button 
    class="copy-button" 
    :class="{ copied: isCopied }"
    @click="handleCopy"
    type="button"
    aria-label="Copy code"
  >
    {{ buttonText }}
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  code: {
    type: String,
    required: true
  }
});

const isCopied = ref(false);
const buttonText = computed(() => isCopied.value ? 'Copied!' : 'Copy');

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
    // Можно добавить обработку ошибок
  }
}
</script>

