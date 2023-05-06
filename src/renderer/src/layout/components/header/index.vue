<template>
  <div class="w-screen h-40px px-10px flex items-center justify-between drag titlebar">
    <div class="no-drag">Logo</div>
    <div class="h-full flex justify-between items-center gap-10px no-drag">
      <nx-button :icon="Subtract24Filled" @click="minimize"/>
      <nx-button :icon="fullscreen" @click="toggleMax" />
      <nx-button :icon="Close" @click="close" />
    </div>
  </div>
</template>

<script setup lang="ts" name="NxLayoutHeader">
import { Close } from '@vicons/ionicons5'
import { Subtract24Filled, FullScreenMaximize24Filled, FullScreenMinimize24Filled } from '@vicons/fluent'
import { computed, ref } from 'vue'
import { NxButton } from '@renderer/components'

const isFull = ref(false)
const fullscreen = computed(() => (isFull.value ? FullScreenMinimize24Filled : FullScreenMaximize24Filled))

const toggleMax = async () => {
  isFull.value = await window.tools.toggleMaximize()
}

const minimize = () => window.tools.minimize()

const close = () => window.tools.close()
</script>

<style scoped lang="less">
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
.titlebar {
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
</style>
