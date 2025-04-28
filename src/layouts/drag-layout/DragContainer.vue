<script setup lang="ts" name="DragContainer">
import type { DropZone, Layout, PanelItem } from 'drag-layout'
import DraggablePanel from './DraggablePanel.vue'
import NestedLayout from './NestedLayout.vue'

// 面板数据
const panels = reactive<PanelItem[]>([
  { id: 'panel1', title: '面板 1', content: '这是可拖拽的面板 1 内容' },
  { id: 'panel2', title: '面板 2', content: '这是可拖拽的面板 2 内容' },
  { id: 'panel3', title: '面板 3', content: '这是可拖拽的面板 3 内容' },
  { id: 'panel4', title: '终端', content: '这是终端面板' },
  { id: 'panel5', title: '输出', content: '这是输出面板' }
])

// 当前布局
const layout = ref<Layout>({
  id: 'root',
  type: 'container',
  direction: 'horizontal',
  children: [
    {
      id: 'container1',
      type: 'panel',
      panelId: 'panel1',
      size: 50
    }
  ]
})

// 拖拽状态
const currentDropZone = ref<DropZone | null>(null)
const isDraggingOver = ref(false)
const dragPanelId = ref<string | null>(null)
const targetContainerId = ref<string | null>(null)
// 拖拽计时器
let dragTimerId: number | null = null

// 显示拖拽标识
const showDropZones = computed(() => isDraggingOver.value && dragPanelId.value !== null)

// 处理拖拽开始
function handleDragStart(id: string) {
  // 清除任何现有计时器
  if (dragTimerId !== null) {
    window.clearTimeout(dragTimerId)
    dragTimerId = null
  }

  dragPanelId.value = id
  // 重置其他状态
  currentDropZone.value = null
  isDraggingOver.value = false
  targetContainerId.value = null
}

// 处理拖拽结束
function handleDragEnd() {
  // 清除任何现有计时器
  if (dragTimerId !== null) {
    window.clearTimeout(dragTimerId)
    dragTimerId = null
  }

  dragPanelId.value = null
  currentDropZone.value = null
  isDraggingOver.value = false
  targetContainerId.value = null
}

// 处理拖拽进入
function handleDragEnter(event: DragEvent, containerId: string) {
  if (!dragPanelId.value)
    return
  if (!event.dataTransfer)
    return

  event.preventDefault()
  event.stopPropagation()

  // 立即设置目标容器，无延迟
  targetContainerId.value = containerId
  isDraggingOver.value = true
}

// 处理拖拽离开
function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // 检查是否真的离开了元素，而不是进入子元素
  if (event.relatedTarget && !isChildOf(event.currentTarget as HTMLElement, event.relatedTarget as HTMLElement)) {
    // 使用短延迟避免闪烁，但保持快速响应
    if (dragTimerId !== null) {
      window.clearTimeout(dragTimerId)
    }

    dragTimerId = window.setTimeout(() => {
      isDraggingOver.value = false
      currentDropZone.value = null
    }, 50)
  }
}

// 判断是否为子元素
function isChildOf(parent: HTMLElement, child: HTMLElement): boolean {
  let node = child.parentNode
  while (node != null) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}

// 处理拖拽悬停
function handleDragOver(event: DragEvent) {
  if (!event.dataTransfer || !dragPanelId.value)
    return

  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'move'

  // 确保激活状态
  if (targetContainerId.value && !isDraggingOver.value) {
    isDraggingOver.value = true
  }

  // 计算拖拽区域
  if (event.currentTarget instanceof HTMLElement) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const width = rect.width
    const height = rect.height

    // 划分五个区域: 上、右、下、左、中
    const zoneSize = 0.25 // 边缘区域占整体的比例

    let newZone: DropZone
    if (y < height * zoneSize) {
      newZone = 'top'
    } else if (x > width * (1 - zoneSize)) {
      newZone = 'right'
    } else if (y > height * (1 - zoneSize)) {
      newZone = 'bottom'
    } else if (x < width * zoneSize) {
      newZone = 'left'
    } else {
      newZone = 'center'
    }

    // 只有当区域变化时才更新，减少重渲染
    if (currentDropZone.value !== newZone) {
      currentDropZone.value = newZone
    }
  }
}

// 处理放置
function handleDrop(event: DragEvent, containerId: string) {
  if (!event.dataTransfer || !dragPanelId.value || !currentDropZone.value) {
    handleDragEnd()
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const panelId = event.dataTransfer.getData('text/plain')

  // 只处理有效的面板ID
  if (!panelId || !panels.some(p => p.id === panelId)) {
    handleDragEnd()
    return
  }

  // 查找目标容器
  const targetContainer = findContainerById(layout.value, containerId)
  if (!targetContainer) {
    handleDragEnd()
    return
  }

  // 不允许拖到自己的面板中心
  if (targetContainer.type === 'panel' && targetContainer.panelId === panelId && currentDropZone.value === 'center') {
    handleDragEnd()
    return
  }

  // 第一步：创建新的布局，不包含要拖拽的面板
  const newLayout = createLayoutWithoutPanel(layout.value, panelId)

  // 第二步：在新布局中找到目标容器
  const newTargetContainer = findContainerById(newLayout, containerId)

  // 如果找不到目标容器（可能目标容器就是被移除的面板），则使用根容器
  const container = newTargetContainer || newLayout

  // 第三步：将面板添加到目标位置
  addPanelToPosition(container, panelId, currentDropZone.value)

  // 更新布局
  layout.value = newLayout

  // 重置拖拽状态
  handleDragEnd()
}

// 创建不包含特定面板的新布局
function createLayoutWithoutPanel(currentLayout: Layout, panelId: string): Layout {
  // 深拷贝当前布局
  const newLayout: Layout = JSON.parse(JSON.stringify(currentLayout))

  // 移除面板
  removePanelFromLayout(newLayout, panelId)

  // 清理空容器和优化结构
  optimizeLayout(newLayout)

  return newLayout
}

// 递归移除布局中的特定面板
function removePanelFromLayout(node: Layout, panelId: string): boolean {
  // 面板节点，检查是否匹配
  if (node.type === 'panel') {
    return node.panelId === panelId
  }

  // 容器节点，检查子节点
  if (node.type === 'container' && node.children) {
    // 移除匹配的子节点
    node.children = node.children.filter(child => !removePanelFromLayout(child, panelId))

    // 返回是否应该移除此节点（空容器）
    return node.children.length === 0
  }

  return false
}

// 优化布局结构（移除空容器，合并单子节点容器）
function optimizeLayout(node: Layout) {
  if (node.type !== 'container' || !node.children)
    return

  // 先递归优化所有子节点
  for (let i = 0; i < node.children.length; i++) {
    optimizeLayout(node.children[i])
  }

  // 过滤掉空容器
  node.children = node.children.filter((child) => {
    return !(child.type === 'container' && (!child.children || child.children.length === 0))
  })

  // 处理单子节点容器
  if (node.children.length === 1 && node.children[0].type === 'container') {
    const onlyChild = node.children[0]
    if (onlyChild.children) {
      // 将子容器的子节点提升到当前容器
      node.direction = onlyChild.direction || node.direction
      node.children = [...onlyChild.children]
    }
  }

  // 重新计算尺寸
  if (node.children.length > 0) {
    const newSize = 100 / node.children.length
    node.children.forEach((child) => {
      child.size = newSize
    })
  }
}

// 将面板添加到指定位置
function addPanelToPosition(container: Layout, panelId: string, zone: DropZone) {
  // 处理面板容器
  if (container.type === 'panel') {
    const originalPanelId = container.panelId
    if (!originalPanelId)
      return

    // 转换为容器
    container.type = 'container'
    container.direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    delete container.panelId

    // 根据放置区域确定子面板顺序
    const isFirst = zone === 'left' || zone === 'top'
    container.children = isFirst
      ? [
          { id: `panel-${panelId}-${Date.now()}`, type: 'panel', panelId, size: 50 },
          { id: `panel-${originalPanelId}-${Date.now()}`, type: 'panel', panelId: originalPanelId, size: 50 }
        ]
      : [
          { id: `panel-${originalPanelId}-${Date.now()}`, type: 'panel', panelId: originalPanelId, size: 50 },
          { id: `panel-${panelId}-${Date.now()}`, type: 'panel', panelId, size: 50 }
        ]
  }
  // 处理容器
  else if (container.type === 'container' && container.children) {
    if (zone === 'center') {
      // 中心放置 - 替换或添加为第一个
      if (container.children.length > 0) {
        const firstChild = container.children[0]
        if (firstChild.type === 'panel') {
          // 替换第一个面板
          firstChild.panelId = panelId
        } else {
          // 添加到开头
          container.children.unshift({
            id: `panel-${panelId}-${Date.now()}`,
            type: 'panel',
            panelId,
            size: 100 / (container.children.length + 1)
          })
        }
      } else {
        // 空容器，直接添加
        container.children.push({
          id: `panel-${panelId}-${Date.now()}`,
          type: 'panel',
          panelId,
          size: 100
        })
      }
    } else {
      // 边缘放置
      const newDirection = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'

      // 方向匹配，直接添加
      if (container.direction === newDirection) {
        if (zone === 'left' || zone === 'top') {
          container.children.unshift({
            id: `panel-${panelId}-${Date.now()}`,
            type: 'panel',
            panelId,
            size: 100 / (container.children.length + 1)
          })
        } else {
          container.children.push({
            id: `panel-${panelId}-${Date.now()}`,
            type: 'panel',
            panelId,
            size: 100 / (container.children.length + 1)
          })
        }
      } else {
        // 方向不匹配，创建嵌套结构
        const originalChildren = [...container.children]
        container.children = [{
          id: `container-${Date.now()}`,
          type: 'container',
          direction: newDirection,
          children: [
            { id: `panel-${panelId}-${Date.now()}`, type: 'panel', panelId, size: 50 },
            {
              id: `container-nested-${Date.now()}`,
              type: 'container',
              direction: container.direction || 'horizontal',
              children: originalChildren,
              size: 50
            }
          ],
          size: 100
        }]
      }
    }

    // 重新计算所有子节点尺寸
    const newSize = 100 / container.children.length
    container.children.forEach((child) => {
      child.size = newSize
    })
  }
}

// 查找容器
function findContainerById(node: Layout, id: string): Layout | null {
  if (node.id === id) {
    return node
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findContainerById(child, id)
      if (found) {
        return found
      }
    }
  }

  return null
}
</script>

<template>
  <div class="drag-container">
    <div class="toolbar">
      <h3>拖拽布局演示</h3>
      <div class="panel-list">
        <DraggablePanel
          v-for="panel in panels"
          :id="panel.id"
          :key="panel.id"
          :title="panel.title"
          class="panel-item"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        >
          <div class="panel-preview">
            {{ panel.title }}
          </div>
        </DraggablePanel>
      </div>
    </div>

    <div class="layout-container">
      <NestedLayout
        :item="layout"
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
    </div>
  </div>
</template>

<style scoped>
.drag-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--app-background, #1e1e1e);
  color: var(--app-foreground, #cccccc);
}

.toolbar {
  padding: 10px;
  background-color: #252526;
  border-bottom: 1px solid #444;
}

.toolbar h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #e6e6e6;
}

.panel-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.panel-item {
  flex: 0 0 150px;
  height: 60px;
  border: 1px solid #444;
  border-radius: 4px;
}

.panel-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: #cccccc;
}

.layout-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
