<script setup lang="ts">
import type { IDockviewPanelHeaderProps, TitleEvent } from 'dockview-vue'
import { SmileLoading } from '@/components'

interface ITerminalTabProps {
  status: 'success' | 'error' | 'loading'
}
const { params } = defineProps<{ params: IDockviewPanelHeaderProps<ITerminalTabProps> }>()
const title = ref('')
watchEffect(() => {
  params.api.onDidTitleChange((x: TitleEvent) => {
    title.value = x.title
  })
})
function handleClose() {
  params.api.close()
}
</script>

<template>
  <div class="flex items-center gap-5">
    <SmileLoading :status="params.params.status" :size="14" />
    <span class="text-sm">{{ title }}</span>
    <n-button size="tiny" secondary strong @click="() => handleClose()">
      x
    </n-button>
  </div>
</template>
