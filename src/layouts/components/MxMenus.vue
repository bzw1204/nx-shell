<script setup lang="ts">
import { ThemeToggle } from '@/components'
import {
  CopyOutline,
  ExtensionPuzzleOutline,
  SearchOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { NButton, NIcon, NTooltip } from 'naive-ui'
import { ref } from 'vue'
import FileExplorer from './FileExplorer.vue'

const emit = defineEmits(['togglePanel'])

const activeKey = ref('explorer')

const menuItems = [
  {
    icon: CopyOutline,
    tooltip: '资源管理器',
    key: 'explorer',
    component: FileExplorer,
    fn: () => {
      emit('togglePanel')
    }
  },
  { icon: SearchOutline, tooltip: '搜索', key: 'search' },
  { icon: ExtensionPuzzleOutline, tooltip: '扩展', key: 'extensions' }
]

function handleMenuClick(item: any) {
  if (item.key === activeKey.value) {
    // 如果点击当前激活的菜单项，则切换面板显示状态
    item.fn()
    emit('togglePanel')
  } else {
    // 切换到新的菜单项
    activeKey.value = item.key
  }
}
function handleSetting() {
  window.dockview.addPanel({
    id: 'setting',
    title: '设置',
    component: 'settings'
  })
}
</script>

<template>
  <n-el class=":uno: box-border h-full flex flex-col justify-between pb-10">
    <div class=":uno: flex flex-1 flex-col items-center gap-10">
      <NTooltip v-for="item in menuItems" :key="item.key" placement="right" :show-arrow="false">
        <template #trigger>
          <div
            class=":uno: menu-item flex-center"
            :class="{
              ':uno: text-[var(--primary-color)] !border-l-[var(--primary-color)]': activeKey === item.key,
            }"
            @click="handleMenuClick(item)"
          >
            <NIcon size="24">
              <component :is="item.icon" />
            </NIcon>
          </div>
        </template>
        {{ item.tooltip }}
      </NTooltip>
    </div>
    <div class=":uno: flex flex-col items-center gap-20 pb-10">
      <ThemeToggle />
      <NTooltip placement="right" :show-arrow="false">
        <template #trigger>
          <NButton
            text
            class=":uno: w-full flex justify-center text-gray-400 hover:text-white"
            @click="handleSetting"
          >
            <NIcon size="24">
              <SettingsOutline />
            </NIcon>
          </NButton>
        </template>
        设置
      </NTooltip>
    </div>
  </n-el>
</template>

<style scoped lang="scss">
.menu-item {
  --at-apply: box-border w-full border-l-2 border-l-transparent border-l-solid p-5;

  &:hover {
    --at-apply: text-[var(--primary-color)] cursor-pointer;
  }
}
</style>
