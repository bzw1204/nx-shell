<script setup lang="ts">
import { SmailLoading } from '@/components'

const loading = ref(true)
const status = ref<'success' | 'error'>('success')
function toggleLoading() {
  loading.value = !loading.value
  status.value = status.value === 'success' ? 'error' : 'success'
}
</script>

<template>
  <n-flex>
    <n-button @click="toggleLoading">
      toggle
    </n-button>
    <SmailLoading :loading="loading" :status="status" :size="50" />
  </n-flex>
</template>
