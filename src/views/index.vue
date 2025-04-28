<script setup lang="ts">
import Terminal from '@/components/terminal/index.vue'
import { DragContainer } from '@/layouts'
import { ref } from 'vue'

const status = ref<any>('loading')
function handleClick() {
  // 获取所有可能的状态
  const allStatus = ['success', 'error', 'loading']
  // 过滤掉当前状态
  const availableStatus = allStatus.filter(s => s !== status.value)
  // 从剩余状态中随机选择一个
  status.value = availableStatus[Math.floor(Math.random() * availableStatus.length)] as any
}

// 控制显示的组件
const showComponent = ref<'drag' | 'terminal'>('terminal')
function toggleComponent() {
  showComponent.value = showComponent.value === 'drag' ? 'terminal' : 'drag'
}
</script>

<template>
  <n-flex vertical class="wh-full">
    <n-flex justify="start" align="center" class="gap-2 p-2">
      <n-button @click="handleClick">
        切换状态
      </n-button>
      <n-button @click="toggleComponent">
        切换{{ showComponent === 'drag' ? '终端' : '拖拽布局' }}
      </n-button>
      <n-text>当前状态: {{ status }}</n-text>
    </n-flex>
    <n-flex class="w-full flex-1">
      <component :is="showComponent === 'drag' ? DragContainer : Terminal" class="h-full w-full" />
    </n-flex>
  </n-flex>
</template>
