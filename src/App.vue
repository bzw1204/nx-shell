<script setup lang="ts">
import { NaiveProviderContent } from '@/components'
import { darkTheme } from 'naive-ui'

const { theme } = storeToRefs(useSettingStore())
</script>

<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : null" class="select-none">
    <NaiveProviderContent>
      <router-view />
    </NaiveProviderContent>
  </n-config-provider>
</template>

<style>
/* 切换主题的动画效果 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}
</style>
