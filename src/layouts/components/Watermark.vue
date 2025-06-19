<script setup lang="ts">
</script>

<template>
  <div class="n-home-empty">
    <div class="n-home-content">
      <span class="n-logo i-color:logo text-70" />
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
        width: 65px;
        height: 60px;
        background: var(--n-text-color);
        transform: translate(-35px, 25px) scaleY(0.5) skew(50deg);
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
