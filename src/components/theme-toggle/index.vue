<script setup lang="ts" name="ThemeToggle">
import { useDark, useToggle } from '@vueuse/core'

interface Props {
  normal?: boolean
  size?: 'small' | 'medium' | 'large'
}
const { normal = false, size = 'small' } = defineProps<Props>()
const settingStore = useSettingStore()
const { theme } = storeToRefs(settingStore)
const isDark = useDark()
async function toggleDark({ clientX, clientY }: MouseEvent) {
  function handler() {
    set(theme, isDark.value ? 'light' : 'dark')
    useToggle(isDark)()
  }

  if (!document.startViewTransition) {
    return handler()
  }

  const clipPath = [
    `circle(0px at ${clientX}px ${clientY}px)`,
    `circle(${Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY)
    )}px at ${clientX}px ${clientY}px)`
  ]

  await document.startViewTransition(handler).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
}
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <NButton
        text
        class=":uno: w-full flex justify-center text-gray-400 hover:text-white"
        :focusable="false"
        :circle="!normal"
        :size="size"
        @click="toggleDark"
      >
        <NIcon size="24">
          <span
            :class="[
              `${isDark ? ':uno: i-carbon-moon moon-anim' : ':uno: i-carbon:sun sun-anim'}`,
            ]"
          />
        </NIcon>
      </NButton>
    </template>
    {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
  </n-tooltip>
</template>

<style scoped lang="scss">
.sun-anim {
  animation: sun-appear 2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes sun-appear {
  0% {
    transform: scale(0.7) rotate(-90deg);
    opacity: 0.2;
    filter: blur(2px);
  }

  60% {
    transform: scale(1.1) rotate(20deg);
    opacity: 1;
    filter: blur(0);
  }

  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0);
  }
}

.moon-anim {
  animation: moon-appear 4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes moon-appear {
  0% {
    transform: scale(0.7) rotate(45deg);
    opacity: 0.2;
    filter: blur(2px);
  }

  60% {
    transform: scale(1.1) rotate(-10deg);
    opacity: 1;
    filter: blur(0);
  }

  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0);
  }
}
</style>
