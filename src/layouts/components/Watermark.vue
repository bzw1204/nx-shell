<script setup lang="ts">
import { SmileLoading } from '@/components'
import { useAnimationFrame } from 'motion-v'

const cubeRef = ref<HTMLElement | null>(null)
const statusRef = ref<'success' | 'error' | 'loading'>('loading')
useAnimationFrame((t) => {
  const rotate = Math.sin(t / 10000) * 200
  const y = (1 + Math.sin(t / 1000)) * -50
  if (cubeRef.value) {
    cubeRef.value!.style.transform = `translateY(${y}px) rotateX(${rotate}deg) rotateY(${rotate}deg)`
  }
})
</script>

<template>
  <!-- <div class="n-home-empty">
    <div class="n-home-content">
      <div class="n-logo">
        <span class="i-color:logo text-70" />
      </div>
      <p class="n-logo-text">
        NxShell
      </p>
    </div>
    <h1>欢迎使用</h1>
    <div class="n-home-footer">
      <div class="n-home-footer__feedback" />
      <div class="n-home-footer__version">
        V1.0.0
      </div>
    </div>
  </div> -->
  <div class="wh-full flex items-center justify-center">
    <div class="[perspective:800px] h-40 w-40">
      <div
        ref="cubeRef"
        class="[transform-style:preserve-3d] relative h-100 w-100"
      >
        <div class="[transform:rotateY(0deg)_translateZ(100px)] absolute h-full w-full bg-red-500/60">
          NxShell
        </div>
        <div class="[transform:rotateY(90deg)_translateZ(100px)] absolute h-full w-full bg-yellow-500/60" />
        <div class="[transform:rotateY(180deg)_translateZ(100px)] absolute h-full w-full bg-pink-500/60" />
        <div class="[transform:rotateY(-90deg)_translateZ(100px)] absolute h-full w-full bg-purple-500/60" />
        <div class="[transform:rotateX(90deg)_translateZ(100px)] absolute h-full w-full bg-blue-500/60" />
        <div class="[transform:rotateX(-90deg)_translateZ(100px)] absolute h-full w-full bg-emerald-500/60" />
      </div>
    </div>
    <TextHoverEffect
      class="min-lg:min-h-64 w-[90%]"
      text="NxShell"
    />
    <n-flex vertical>
      <n-radio-group v-model:value="statusRef" name="radiogroup">
        <n-space>
          <n-radio v-for="item in ['success', 'error', 'loading']" :key="item" :value="item">
            {{ item }}
          </n-radio>
        </n-space>
      </n-radio-group>
      <SmileLoading :status="statusRef" />
    </n-flex>
  </div>
</template>

<style lang='scss' scoped>
.n-home-empty {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--n-color);
  h1 {
    color: var(--n-text-color);
  }

  .n-home-content {
    flex: 1 0 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .n-logo {
      display: inline-block;
      box-sizing: border-box;
      z-index: 0;

      &::before {
        position: absolute;
        content: '';
        width: 60px;
        height: 60px;
        background: var(--n-text-color);
        transform: translate(-25px, 25px) scaleY(0.5) skew(50deg);
        z-index: -1;
        filter: blur(5px);
        -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(var(--n-color)));
        mask-image: linear-gradient(to bottom, transparent, var(--n-color));
      }
    }

    .n-logo-text {
      margin-left: 60px;
      font-size: 80px;
      font-weight: 700;
      color: var(--n-text-color);
      z-index: 0;

      &::before {
        position: absolute;
        content: 'NxShell';
        color: var(--n-text-color);
        transform: translate(-35px, 15px) scaleY(0.5) skew(50deg);
        z-index: -1;
        filter: blur(3px);
        -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(var(--n-color)));
        mask-image: linear-gradient(to bottom, transparent, var(--n-color));
      }
    }
  }

  .n-home-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;
    padding: 5px 15px;
    box-sizing: border-box;
    background-color: var(--n-bg-color-base);
    color: var(--n-text-color);

    &__feedback {
      display: flex;
      align-items: center;
      column-gap: 20px;

      .n-icon-button {
        font-size: 13px;
      }
    }
  }
}
</style>
