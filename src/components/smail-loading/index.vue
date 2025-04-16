<script setup lang="ts" name="SmailLoading">
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
  <div
    class="smile-loading-container"
    :style="containerStyle"
  >
    <!-- 进度条 SVG -->
    <svg
      class="smile-loading-svg"
      :class="{ 'is-loading': loading }"
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
      <circle
        class="path"
        :class="{
          'is-loading': loading,
          'is-success': status === 'success',
          'is-error': status === 'error',
        }"
        cx="256"
        cy="256"
        r="204"
        fill="none"
        stroke-width="20"
      />
    </svg>

    <!-- 表情图标 SVG -->
    <svg
      class="smile-icon-svg"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="geometricPrecision"
    >
      <g
        class="smile-icon"
        :class="{
          'is-loading': loading,
          'is-success': status === 'success',
          'is-error': status === 'error',
        }"
        fill="none"
      >
        <!-- 脸部轮廓和眼睛 -->
        <circle cx="256" cy="256" r="133" fill="var(--color)" class="face" />
        <circle cx="205" cy="225" r="20" fill="var(--n-color)" class="eye" />
        <circle cx="307" cy="225" r="20" fill="var(--n-color)" class="eye" />

        <!-- 嘴巴 - 根据状态变化 -->
        <path
          v-if="status === 'success'"
          d="M205,287 Q256,338 307,287"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
        />
        <path
          v-if="status === 'error'"
          d="M205,307 Q256,266 307,307"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
        />
        <path
          v-if="status === 'loading'"
          d="M205,297 L307,297"
          stroke="var(--n-color)"
          stroke-width="20"
          stroke-linecap="round"
          fill="none"
          class="mouth"
        />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.smile-loading-container {
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-duration: 0.3s;

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
    transition: transform var(--transition-duration) var(--transition-timing);
    will-change: transform;

    &.is-loading {
      animation: container-rotate 3s linear infinite;
    }
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
    transition: all var(--transition-duration) var(--transition-timing);
    will-change: stroke-dashoffset, stroke;
    stroke-dasharray: 1282;
    stroke-dashoffset: 0;

    &.is-loading {
      stroke-dasharray: 128, 1282;
      animation: spinner-dash 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    &.is-success,
    &.is-error {
      stroke-dasharray: 1282;
      stroke-dashoffset: 0;
      animation: none;
    }
  }

  .smile-icon {
    transform-origin: center;
    transition: all var(--transition-duration) var(--transition-timing);

    &.is-loading {
      opacity: 0.9;
      transform: scale(0.95);
    }

    &.is-success {
      transform: scale(1.05);
    }

    &.is-error {
      transform: scale(0.95);
    }

    .face {
      transition: transform var(--transition-duration) var(--transition-timing);
    }

    .eye {
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .mouth {
      transition: all var(--transition-duration) var(--transition-timing);
    }

    circle,
    path {
      transform-origin: center;
    }
  }
}

@keyframes container-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 128, 1282;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 855, 1282;
    stroke-dashoffset: -500;
  }
  100% {
    stroke-dasharray: 128, 1282;
    stroke-dashoffset: -1282;
  }
}
</style>
