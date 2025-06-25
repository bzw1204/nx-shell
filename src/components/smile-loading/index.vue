<script setup lang="ts" name="SmileLoading">
import type { Easing } from 'motion-v/dist/es/types'
import { motion } from 'motion-v'

interface Props {
  size?: number
  color?: {
    success: string
    error: string
    loading: string
  }
  status?: 'success' | 'error' | 'loading'
}
const { size = 50, status = 'success', color } = defineProps<Props>()
const defaultColor = {
  success: '#36ad6a',
  error: '#d03050',
  loading: '#0dcecb'
}
const loading = computed(() => status === 'loading')

// 添加状态颜色映射
const containerStyle = computed(() => ({
  '--size': `${size}px`,
  '--color': (color || defaultColor)[status]
}))
</script>

<template>
  <div class="smile-loading-container" :style="containerStyle">
    <!-- 进度条 SVG -->
    <svg
      class="smile-loading-svg"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="geometricPrecision"
    >
      <!-- 背景圆环 -->
      <circle
        v-if="!loading"
        class="circle-track"
        cx="256"
        cy="256"
        r="204"
        fill="none"
        stroke-width="20"
      />
      <!-- 动态进度条 -->
      <motion.circle
        :key="loading ? 'loading' : 'normal'"
        class="path"
        cx="256"
        cy="256"
        r="204"
        fill="none"
        stroke-width="20"
        :animate="{
          strokeDasharray: `${loading ? '0, 1282' : '1282, 0'}`,
          strokeDashoffset: [1282, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: [1, 0.2, 4, 0.3],
          },
        }"
      />
    </svg>

    <!-- 表情图标 SVG -->
    <svg
      class="smile-icon-svg"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="geometricPrecision"
    >
      <motion.g class="smile-icon" fill="none">
        <!-- 脸部轮廓和眼睛 -->
        <circle cx="256" cy="256" r="133" fill="var(--color)" class="face" />
        <circle cx="205" cy="225" r="20" fill="var(--n-color)" class="eye" />
        <circle cx="307" cy="225" r="20" fill="var(--n-color)" class="eye" />

        <!-- 嘴巴 - 根据状态变化 -->
        <motion.path
          v-if="status === 'success'"
          d="M205,287 Q256,338 307,287"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
          :initial="{ pathLength: 0 }"
          :animate="{ pathLength: 1 }"
          :transition="{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing }"
        />
        <motion.path
          v-if="status === 'error'"
          d="M205,307 Q256,266 307,307"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
          :initial="{ pathLength: 0 }"
          :animate="{ pathLength: 1 }"
          :transition="{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing }"
        />
        <motion.path
          v-if="status === 'loading'"
          d="M205,297 L307,297"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
          :initial="{ pathLength: 0 }"
          :animate="{ pathLength: 1 }"
          :transition="{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as Easing }"
        />
      </motion.g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.smile-loading-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);

  .smile-loading-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    will-change: transform;
  }

  .smile-icon-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .circle-track {
    stroke: var(--color);
    stroke-opacity: 0.2;
  }

  .path {
    stroke: var(--color);
    stroke-linecap: round;
    stroke-width: 20;
    fill: none;
    transform-origin: center;
    transform: rotate(90deg); // 起点从底部
    will-change: stroke-dashoffset, stroke;
  }

  .smile-icon {
    transform-origin: center;

    .face {
      transform-origin: center;
    }

    .eye {
      transform-origin: center;
    }

    .mouth {
      transform-origin: center;
    }

    circle,
    path {
      transform-origin: center;
    }
  }
}
</style>
