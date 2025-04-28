<script setup lang="ts">
import {
  CopyOutline,
  ExtensionPuzzleOutline,
  GitBranchOutline,
  SearchOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { NButton, NIcon, NTooltip } from 'naive-ui'
import { ref } from 'vue'

const emit = defineEmits(['togglePanel'])

const activeKey = ref('explorer')

const menuItems = [
  { icon: CopyOutline, tooltip: '资源管理器', key: 'explorer' },
  { icon: SearchOutline, tooltip: '搜索', key: 'search' },
  { icon: GitBranchOutline, tooltip: 'Git', key: 'git' },
  { icon: ExtensionPuzzleOutline, tooltip: '扩展', key: 'extensions' }
]

function handleMenuClick(key: string) {
  if (key === activeKey.value) {
    // 如果点击当前激活的菜单项，则切换面板显示状态
    emit('togglePanel')
  } else {
    // 切换到新的菜单项
    activeKey.value = key
  }
}
</script>

<template>
  <div class="h-full flex flex-col justify-between">
    <div class="flex flex-1 flex-col items-center gap-2 py-2">
      <NTooltip v-for="item in menuItems" :key="item.key" placement="right" :show-arrow="false">
        <template #trigger>
          <NButton
            text
            class="w-full flex justify-center py-2"
            :class="{
              'text-gray-400 hover:text-white': activeKey !== item.key,
              'text-white bg-gray-700': activeKey === item.key,
            }"
            @click="handleMenuClick(item.key)"
          >
            <NIcon size="24">
              <component :is="item.icon" />
            </NIcon>
          </NButton>
        </template>
        {{ item.tooltip }}
      </NTooltip>
    </div>
    <div class="mt-auto flex flex-col items-center py-2">
      <NTooltip placement="right" :show-arrow="false">
        <template #trigger>
          <NButton text class="w-full flex justify-center py-2 text-gray-400 hover:text-white">
            <NIcon size="24">
              <SettingsOutline />
            </NIcon>
          </NButton>
        </template>
        设置
      </NTooltip>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-button:not(.n-button--disabled):focus) {
  box-shadow: none;
}
</style>
