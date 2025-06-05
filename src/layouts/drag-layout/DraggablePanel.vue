<script setup lang="ts">
const props = defineProps<{
  id: string
  title: string
}>()

const emit = defineEmits<{
  (e: 'dragStart', id: string, event: DragEvent): void
  (e: 'dragEnd', id: string, event: DragEvent): void
}>()

const isDragging = ref(false)

const panelClasses = computed(() => ({
  'draggable-panel': true,
  'is-dragging': isDragging.value
}))

function handleDragStart(event: DragEvent) {
  if (!event.dataTransfer)
    return

  // 设置拖拽标志
  isDragging.value = true

  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.id)

  // 简单设置拖拽图像，不过度复杂化
  if (event.target instanceof HTMLElement) {
    event.dataTransfer.setDragImage(event.target, 10, 10)
  }

  emit('dragStart', props.id, event)
}

function handleDragEnd(event: DragEvent) {
  // 重置拖拽状态
  isDragging.value = false
  emit('dragEnd', props.id, event)
}
</script>

<template>
  <div
    :class="panelClasses"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class=":uno: panel-header">
      <div class=":uno: panel-title">
        {{ title }}
      </div>
      <div class=":uno: panel-drag-handle">
        <span class=":uno: drag-icon">⋮⋮</span>
      </div>
    </div>
    <div class=":uno: panel-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.draggable-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--panel-background, #1e1e1e);
  color: var(--panel-color, #cccccc);
  border: 1px solid transparent;
  overflow: hidden;
  cursor: move;
}

.is-dragging {
  opacity: 0.6;
  border: 1px dashed #007fd4;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  height: 28px;
  background-color: var(--panel-header-background, #252526);
  border-bottom: 1px solid var(--panel-border-color, #444444);
  cursor: move;
}

.panel-title {
  font-size: 12px;
  font-weight: 400;
}

.panel-drag-handle {
  cursor: move;
  user-select: none;
  color: #888;
}

.drag-icon {
  padding: 2px 4px;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}
</style>
