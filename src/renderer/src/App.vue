<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <app />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui'
</script>

<style scoped></style>
