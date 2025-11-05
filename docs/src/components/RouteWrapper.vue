<template>
  <div class="route-wrapper">
    <MarkdownWrapper :component="component" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import MarkdownWrapper from './MarkdownWrapper.vue';

const props = defineProps({
  component: {
    type: [Object, Function, Promise],
    required: true,
  },
});
</script>

<style scoped>
.route-wrapper {
  width: 100%;
}
</style>

