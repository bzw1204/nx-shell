<template>
  <div class="nx-home w-full h-full flex flex-col justify-between">
    <div class="nx-home__container">
      1122 {{ os }}
    </div>
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
</script>

<style scoped></style>
