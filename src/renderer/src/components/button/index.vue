<template>
  <n-button text :focusable="false" v-bind="$attrs">
    <template v-if="props.icon" #icon>
      <n-icon>
        <component :is="props.icon" />
      </n-icon>
    </template>
    {{ props.label }}
  </n-button>
</template>

<script setup lang="ts" name="NxButton">
const props = defineProps<{
  icon?: Component,
  label?: string
}>()
</script>

<style scoped></style>
