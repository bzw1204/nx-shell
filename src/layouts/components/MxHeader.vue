<script setup lang="ts" name="MxHeader">
import SystemControl from './SystemControl.vue'

const isMac = ref(window.$api.platform.isMacOS)
function handleLocalTerminal() {
  window.dockview.addPanel({
    id: 'local-terminal',
    title: 'Local Terminal',
    component: 'NxTerminal',
    params: {
      type: 'local',
      id: new Date().getTime()
    }
  })
}
</script>

<template>
  <n-flex justify="space-between" align="center" class=":uno: box-border h-40 pl-10 backdrop-blur-50 drag">
    <div class=":uno: flex flex-1 items-center justify-start">
      <div v-show="!isMac" class=":uno: i-color:logo text-28" />
      <span class="i-local:terminal ml-80 text-24 no-drag hover:cursor-pointer" @click="handleLocalTerminal" />
    </div>
    <!-- 右侧控制 -->
    <SystemControl class=":uno: self-start" />
  </n-flex>
</template>
