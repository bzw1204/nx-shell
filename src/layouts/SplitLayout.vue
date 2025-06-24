<script setup lang="ts">
import type { DockviewReadyEvent } from 'dockview-vue'
import { themeDracula } from 'dockview-core'
import { DockviewVue } from 'dockview-vue'
import { FileExplorer } from './components'
import 'dockview-vue/dist/styles/dockview.css'

function onReady({ api }: DockviewReadyEvent) {
  window.dockview = api
  // 右侧编辑器面板
  // api.addPanel({
  //   id: 'editor',
  //   title: 'Editor',
  //   component: 'editor'
  // })
}
const showPanel = ref('200px')
</script>

<template>
  <n-split
    direction="horizontal"
    class="h-content"
    :min="0"
    :max="0.3"
    :resize-trigger-size="1"
    :watch-props="['defaultSize']"
    :default-size="showPanel"
  >
    <template #1>
      <component :is="FileExplorer" />
    </template>
    <template #2>
      <n-el class="wh-full">
        <DockviewVue
          class="wh-full"
          :theme="themeDracula"
          watermark-component="watermark"
          :disable-floating-groups="true"
          @ready="onReady"
        />
      </n-el>
    </template>
  </n-split>
</template>
