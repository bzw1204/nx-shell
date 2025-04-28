<script setup lang="ts">
import type { DropZone, Layout, PanelItem } from 'drag-layout'
import { defineEmits, defineProps, ref } from 'vue'
import DraggablePanel from './DraggablePanel.vue'

const props = defineProps<{
  item: Layout
  panels: PanelItem[]
  showDropZones: boolean
  currentDropZone: DropZone | null
  targetContainerId: string | null
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent, id: string): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent, id: string): void
  (e: 'dragStart', id: string): void
  (e: 'dragEnd'): void
}>()

// 当前面板是活跃拖拽目标
const isActive = ref(false)

// 查找面板信息
function findPanelById(id: string): PanelItem | undefined {
  return props.panels.find(panel => panel.id === id)
}

// 事件处理函数
function handleDragEnter(event: DragEvent, id: string) {
  event.preventDefault()
  event.stopPropagation()
  isActive.value = true
  emit('dragEnter', event, id)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('dragOver', event)
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // 检查是否真的离开了元素
  if (!elementContains(event.currentTarget as HTMLElement, event.relatedTarget as HTMLElement)) {
    isActive.value = false
    emit('dragLeave', event)
  }
}

function handleDrop(event: DragEvent, id: string) {
  event.preventDefault()
  event.stopPropagation()
  isActive.value = false
  emit('drop', event, id)
}

function handleDragStart(id: string) {
  emit('dragStart', id)
}

function handleDragEnd() {
  isActive.value = false
  emit('dragEnd')
}

// 检查元素是否包含另一个元素
function elementContains(parent: HTMLElement | null, child: HTMLElement | null): boolean {
  if (!parent || !child) {
    return false
  }
  return parent.contains(child)
}
</script>

<template>
  <div
    v-if="item.type === 'panel' && item.panelId"
    class="panel-container"
    :class="{ 'active-panel': isActive }"
    :style="{ flex: `${item.size || 1} 1 0%` }"
    @dragenter.capture="handleDragEnter($event, item.id)"
    @dragover.capture="handleDragOver"
    @dragleave.capture="handleDragLeave"
    @drop.capture="handleDrop($event, item.id)"
  >
    <div
      v-if="showDropZones && targetContainerId === item.id"
      class="drop-indicator"
      :class="[currentDropZone]"
    />

    <DraggablePanel
      :id="item.panelId"
      :title="findPanelById(item.panelId)?.title || ''"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    >
      <div>{{ findPanelById(item.panelId)?.content }}</div>
    </DraggablePanel>
  </div>

  <div
    v-else-if="item.type === 'container' && item.children && item.children.length > 0"
    class="container"
    :class="[item.direction]"
    :style="{ flex: `${item.size || 1} 1 0%` }"
  >
    <template v-for="(child, index) in item.children" :key="child.id">
      <!-- 递归渲染子容器 -->
      <NestedLayout
        :item="child"
        :panels="panels"
        :show-drop-zones="showDropZones"
        :current-drop-zone="currentDropZone"
        :target-container-id="targetContainerId"
        @drag-enter="handleDragEnter"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />

      <!-- 容器之间的分隔线 -->
      <div
        v-if="index < item.children.length - 1"
        class="divider"
        :class="[item.direction]"
      />
    </template>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
}

.container.horizontal {
  flex-direction: row;
}

.container.vertical {
  flex-direction: column;
}

.panel-container {
  position: relative;
  height: 100%;
  width: 100%;
  transition: background-color 0.1s;
}

.active-panel {
  background-color: rgba(0, 127, 212, 0.05);
}

.divider {
  background-color: #333;
  z-index: 10;
  transition: background-color 0.2s;
}

.divider:hover {
  background-color: #007fd4;
}

.divider.horizontal {
  width: 4px;
  cursor: col-resize;
}

.divider.vertical {
  height: 4px;
  cursor: row-resize;
}

.drop-indicator {
  position: absolute;
  background-color: rgba(0, 127, 212, 0.5);
  z-index: 100;
  border: 2px dashed #007fd4;
  pointer-events: none;
  transition: all 0.15s ease-out;
}

.drop-indicator.top {
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
}

.drop-indicator.right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 30%;
}

.drop-indicator.bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
}

.drop-indicator.left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 30%;
}

.drop-indicator.center {
  top: 30%;
  left: 30%;
  right: 30%;
  bottom: 30%;
  background-color: rgba(0, 127, 212, 0.3);
}
</style>
