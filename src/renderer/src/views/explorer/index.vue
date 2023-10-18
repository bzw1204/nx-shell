<template>
  <div>
    我是俄式的
    {{ contentsId }}
  </div>
</template>

<script setup lang="ts">
const contentsId = ref('我是测试的')
// window.electron.ipcRenderer.on('window-id', (args) => {
//   console.log('args', args)
// })
onMounted(() => {})
</script>

<style scoped></style>
