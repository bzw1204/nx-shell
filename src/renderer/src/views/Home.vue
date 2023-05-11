<template>
  <div class="nx-home w-full h-full flex flex-col justify-between">
    <div class="nx-home__container">1122 {{ os }} {{ result }}</div>
    <div class="nx-home__footer w-full flex justify-between items-center">
      <div class="flex justify-start items-center gap-x-10px">
        <nx-button :icon="HomeOutline" label="官网" />
        <nx-button :icon="LogoGithub" label="GitHub" />
        <nx-button :icon="BugSharp" label="报告问题" />
      </div>
      <div class="px-10px">当前版本: 1.0.0</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NxButton } from '@renderer/components'
import { HomeOutline, LogoGithub, BugSharp } from '@vicons/ionicons5'

const os = window.api.platform
const result = ref()
window.tools.getGist('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', 'dcccd6ff6f5771c7934ca68ce1bcc157').then((res) => {
  console.log('gist', res)
})
window.tools.updateGist('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', 'dcccd6ff6f5771c7934ca68ce1bcc157',{
  files:{
    'nxshell.json': {
      content: JSON.stringify({"iv":"96ac1b4be2a826cbe3c9b1c695fdb004","content":"123456"})
    }
  }
}).then((res) => {

})
</script>

<style scoped></style>
