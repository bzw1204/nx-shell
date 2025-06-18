<script setup lang="ts" name="LeftAction">
import type { IDockviewHeaderActionsProps } from 'dockview-vue'

const { params } = defineProps<{
  params: IDockviewHeaderActionsProps
}>()
const panelCount = ref(0)
function onClick() {
  params.containerApi.addPanel({
    id: (++panelCount.value).toString(),
    title: `Tab ${panelCount.value}`,
    component: 'editor',
    position: { referenceGroup: params.group }
  })
}
</script>

<template>
  <div class=":uno: h-full cursor-pointer p-2" @click="onClick">
    <span class=":uno: i-carbon:add-filled" />
  </div>
</template>
