<script setup lang="ts" name="MxHeader">
import SystemControl from './SystemControl.vue'
</script>

<template>
  <n-flex justify="space-between" align="center" class=":uno: box-border h-40 pl-10 backdrop-blur-50 drag">
    <div class=":uno: i-color:logo text-28" />
    <!-- 右侧控制 -->
    <SystemControl class=":uno: self-start" />
  </n-flex>
</template>
