<script setup lang="ts">
import type { DockviewReadyEvent } from 'dockview-vue'
import { themeDracula } from 'dockview-core'
import { DockviewVue } from 'dockview-vue'
import { FileExplorer, MxHeader, MxMenus } from './components'
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
function togglePanel() {
  console.log(showPanel.value)
  showPanel.value = showPanel.value === '200px' ? '0' : '200px'
}
</script>

<template>
  <n-layout :native-scrollbar="false" class="wh-full overflow-hidden">
    <n-layout-header>
      <MxHeader />
    </n-layout-header>
    <n-layout :native-scrollbar="false" has-sider>
      <!-- 活动栏 - 类似VSCode左侧图标栏 -->
      <n-layout-sider
        :native-scrollbar="false"
        class="h-content"
        content-class="h-[calc(100vh-40px)] border-box"
        :width="48"
        :collapsed-width="48"
        bordered
      >
        <MxMenus @click="togglePanel" />
      </n-layout-sider>

      <!-- 主内容区域 - 使用分割面板 -->
      <n-layout-content class="h-content">
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
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style lang="scss" scoped>
.dockview-theme-abyss {
  .groupview {
    &.active-group {
      > .tabs-and-actions-container {
        border-bottom: 2px solid var(--dv-activegroup-visiblepanel-tab-background-color);
      }
    }
    &.inactive-group {
      > .tabs-and-actions-container {
        border-bottom: 2px solid var(--dv-inactivegroup-visiblepanel-tab-background-color);
      }
    }
  }
}
</style>
