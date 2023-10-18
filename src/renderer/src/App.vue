<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <router-view></router-view>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'

const theme = ref<GlobalTheme | null>(darkTheme)
</script>

<style scoped></style>
