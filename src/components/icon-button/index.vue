<script setup lang="ts" name="IconButton">
import type { Component } from 'vue'

interface IconButtonProps {
  iconName: string | Component
  iconSize?: number
  customClass?: string
  ariaLabel?: string
  tooltip: string
}
const { iconName, iconSize = 24, customClass = '', ariaLabel = '' } = defineProps<IconButtonProps>()
</script>

<template>
  <n-tooltip placement="right" :show-arrow="false">
    <template #trigger>
      <n-button
        v-bind="$attrs"
        :class="customClass"
        :aria-label="ariaLabel"
        text
        :focusable="false"
        class=":uno: w-full flex justify-center text-gray-400 hover:text-white"
      >
        <template v-if="iconName">
          <span v-if="typeof iconName === 'string'" :class="`${iconName} text-${iconSize}`" />
          <n-icon v-else :size="iconSize" :component="iconName as unknown as Component" />
        </template>
        <template v-else>
          <slot />
        </template>
      </n-button>
    </template>
    {{ tooltip || '' }}
  </n-tooltip>
</template>
