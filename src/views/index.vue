<script setup lang="ts">
import { SmailLoading } from '@/components'

const status = ref<any>('loading')
function handleClick() {
  // 获取所有可能的状态
  const allStatus = ['success', 'error', 'loading']
  // 过滤掉当前状态
  const availableStatus = allStatus.filter(s => s !== status.value)
  // 从剩余状态中随机选择一个
  status.value = availableStatus[Math.floor(Math.random() * availableStatus.length)] as any
}
</script>

<template>
  <n-flex>
    <n-button @click="handleClick">
      切换
    </n-button>
    <n-flex>
      <SmailLoading :size="32" :status="status" />
    </n-flex>
  </n-flex>
</template>
