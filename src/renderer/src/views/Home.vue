<template>
  <div class="nx-home w-full h-full flex flex-col justify-between">
    <div class="nx-home__container">
      <n-select :options="options" />
      <n-button @click="openExplorer">打开文件管理器</n-button>
      <n-button @click="sendTo">发送消息</n-button>
    </div>
    <div class="nx-home__footer w-full flex justify-between items-center">
      <div class="flex justify-start items-center gap-x-10px">
        <nx-button :icon="HomeOutline" label="官网" />
        <nx-button :icon="LogoGithub" label="GitHub" />
        <nx-button :icon="BugSharp" label="报告问题" />
      </div>
      <div class="px-10px">当前版本: {{ version }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NxButton } from '@renderer/components'
import { BugSharp, HomeOutline, LogoGithub } from '@vicons/ionicons5'
import { createClient } from 'webdav'

const version = ref()
const options = ref([])
createClient('https://webdav.yuxi.fun:55/WebDav', {
  username: 'baizw',
  password: 'Muyu@891204'
}).getDirectoryContents()
// window.tools.getGist('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', 'dcccd6ff6f5771c7934ca68ce1bcc157').then((res) => {
//   console.log('gist', res)
// })
// window.tools
//   .updateGist('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', 'dcccd6ff6f5771c7934ca68ce1bcc157', {
//     files: {
//       'nxshell.json': {
//         content: JSON.stringify({ iv: '96ac1b4be2a826cbe3c9b1c695fdb004', content: '123456' })
//       }
//     }
//   })
//   .then((res) => {})
const openExplorer = async () => {
  await window.electron.ipcRenderer.invoke('explorer')
}
const sendTo = () => {
  window.electron.ipcRenderer.sendTo(2, 'window-id', 'hello')
}
onMounted(async () => {
  options.value = await window.electron.ipcRenderer.invoke('font-list')
  version.value = await window.electron.ipcRenderer.invoke('app-version')
  const shell = await window.electron.ipcRenderer.invoke('shell')
  console.log('shell', shell)
})
</script>

<style scoped></style>
