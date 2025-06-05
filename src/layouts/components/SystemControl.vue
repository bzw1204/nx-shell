<script setup lang="ts">
import '@electron-uikit/titlebar/renderer'

const isMacOS = ref(window.$api.platform.isMacOS)
</script>

<template>
  <n-el>
    <title-bar v-if="!isMacOS" overlay class=":uno: system-controls" />
  </n-el>
</template>

<style lang="scss" scoped>
.system-controls {
  position: relative;
  width: 102px;
  height: 100%;
  overflow: hidden;
  --tb-control-height: 28px;
  --tb-control-symbol-color: var(--text-color-2);
  --tb-control-hover-color: var(--button-color-2-hover);
  --tb-control-close-symbol-color: var(--text-color-2);
  .window__control {
    background-color: var(--button-color-2);
  }
}
</style>
