<script setup lang="ts">
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
      <n-button
        quaternary
        :circle="!normal"
        :size="size"
        :focusable="false"
        class=":uno: theme-toggle-btn"
        :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        @click="toggleDark"
      >
        <template #icon>
          <span class=":uno: icon-wrapper" :class="{ ':uno: dark': isDark, ':uno: light': !isDark }">
            <span
              :class="[
                `${isDark ? ':uno: i-carbon-moon' : ':uno: i-carbon-sun'}`,
                { ':uno: sun-anim': !isDark, ':uno: moon-anim': isDark },
              ]"
            />
          </span>
        </template>
      </n-button>
    </template>
    {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
  </n-tooltip>
</template>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

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
