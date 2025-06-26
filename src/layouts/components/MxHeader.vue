<script setup lang="ts" name="MxHeader">
import SystemControl from './SystemControl.vue'

const isMac = ref(window.$api.platform.isMacOS)
function handleLocalTerminal() {
  const time = new Date().getTime()
  window.dockview.addPanel({
    id: `local-terminal-${time}`,
    title: 'Local Terminal',
    component: 'NxTerminal',
    tabComponent: 'terminal-tab',
    params: {
      type: 'local',
      id: `${time}`
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
