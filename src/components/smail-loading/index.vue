<script setup lang="ts" name="SmailLoading">
import type { SmileSpinStatus } from 'smail-loading'
import type { StatusColor } from './types'
import { StatusColorMap } from './types'

interface SmileSpinProps {
  size?: number
  loading?: boolean
  status?: SmileSpinStatus
  color?: string
  statusColor?: StatusColor
}
const props = withDefaults(defineProps<SmileSpinProps>(), {
  loading: false,
  size: 50,
  status: 'success',
  color: '#0dcecb'
})

const { size, status, color } = toRefs(props)

const styleVars = computed(() => {
  return {
    '--offset': '4px',
    '--radius': `${size.value}px`,
    '--radius-ab-w': `calc(${size.value / 2}px + var(--offset))`,
    '--radius-ab-h': 'calc(var(--radius-ab-w) * 2)'
  }
})
</script>

<template>
  <div class="smile-spin" :class="{ spin: loading }" :style="styleVars">
    <div
      class="transition-colors"
      :class="status === 'error' ? 'i-local-sad' : 'i-local-smile'"
      :style="{
        color: loading ? color : StatusColorMap[status],
        fontSize: `${Math.floor(size * 0.8)}px`,
      }"
    />
  </div>
</template>

<style lang="scss">
.smile-spin {
  position: relative;
  width: var(--radius);
  height: var(--radius);
  box-shadow: inset 0 0 0 2px v-bind(color);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  transition: box-shadow 0.3s ease;

  &::before,
  &::after {
    content: '';
    width: var(--radius-ab-w);
    height: var(--radius-ab-h);
    position: absolute;
    background-color: var(--n-color, white);
    transition: transform 0.3s ease;
    top: calc(var(--offset) * -1);
    transform: rotate(-180deg);
  }

  &::before {
    left: calc(var(--offset) * -1);
    border-radius: var(--radius-ab-w) 0 0 var(--radius-ab-w);
    transform-origin: var(--radius-ab-w) 50%;
  }

  &::after {
    right: calc(var(--offset) * -1);
    border-radius: 0 var(--radius-ab-w) var(--radius-ab-w) 0;
    transform-origin: 0 50%;
  }

  & div {
    z-index: 2;
    transition:
      transform 0.3s ease,
      color 0.3s ease;
    position: relative;
  }
}

.spin {
  &::before {
    animation: spin-before 2s infinite cubic-bezier(0.42, 0, 0.58, 1);
  }
  &::after {
    animation: spin-after 2s infinite cubic-bezier(0.42, 0, 0.58, 1) 0.5s;
  }
}

@keyframes spin-before {
  0% {
    transform: rotate(-180deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@keyframes spin-after {
  0% {
    transform: rotate(-180deg);
  }
  100% {
    transform: rotate(180deg);
  }
}
</style>
