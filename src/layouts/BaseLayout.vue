<script setup lang="ts">
import MxHeader from '@/layouts/components/MxHeader.vue'
import MxMenus from './components/MxMenus.vue'

const showPanel = ref(true)
function togglePanel() {
  showPanel.value = !showPanel.value
}
</script>

<template>
  <n-layout :native-scrollbar="false" class=":uno: wh-full overflow-hidden">
    <n-layout-header>
      <MxHeader />
    </n-layout-header>
    <n-layout :native-scrollbar="false" has-sider>
      <!-- 活动栏 - 类似VSCode左侧图标栏 -->
      <n-layout-sider
        :native-scrollbar="false"
        class=":uno: h-content"
        content-class="h-[calc(100vh-40px)] border-box"
        :width="48"
        :collapsed-width="48"
        bordered
      >
        <MxMenus @toggle-panel="togglePanel" />
      </n-layout-sider>

      <!-- 主内容区域 - 使用分割面板 -->
      <n-layout-content class=":uno: h-content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
