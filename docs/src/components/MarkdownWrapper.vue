<template>
  <article class="prose">
    <component :is="content" />
  </article>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const props = defineProps({
  component: {
    type: [Object, Function, Promise],
    required: true,
  },
});

// Simply load the markdown component
const content = defineAsyncComponent({
  loader: async () => {
    return typeof props.component === 'function' 
      ? props.component() 
      : Promise.resolve(props.component);
  },
});
</script>
