<script setup lang="ts">
import type { TerminalSession } from 'terminal'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { NxTerminal } from './index'
import { TerminalSessionManager } from './session-manager'

interface TabItem {
  id: string
  title: string
  active: boolean
  terminalInstance: NxTerminal | null
  session: TerminalSession | null
}

// const props = defineProps<{
//   defaultShell?: string
// }>()

// const containerElement = ref<HTMLDivElement>()
const tabs = ref<TabItem[]>([])
const sessionManager = ref<TerminalSessionManager>(new TerminalSessionManager())

// 创建新标签
function createTab(title: string = '终端') {
  const id = `term-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // 先将所有标签设为非活动
  tabs.value.forEach((tab) => {
    tab.active = false
  })

  // 创建新标签
  const newTab: TabItem = {
    id,
    title,
    active: true,
    terminalInstance: null,
    session: null
  }

  tabs.value.push(newTab)

  // 延迟初始化终端，确保DOM已经挂载
  setTimeout(() => {
    initTerminal(newTab.id)
  }, 50)

  return newTab
}

// 初始化终端
function initTerminal(tabId: string) {
  const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
  if (tabIndex === -1)
    return

  const tabItem = tabs.value[tabIndex]
  const terminalContainer = document.getElementById(`terminal-${tabId}`)
  if (!terminalContainer)
    return

  // 创建终端实例
  const terminal = new NxTerminal({
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    cursorBlink: true,
    cursorStyle: 'underline'
  })

  // 打开终端
  terminal.openTerminal(terminalContainer as HTMLElement)
  terminal.writeln(`欢迎使用NxShell终端 - ${new Date().toLocaleString()}`)

  // 保存终端实例
  tabs.value[tabIndex].terminalInstance = terminal

  // 这里需要连接到实际的会话，例如：
  // const session = await createLocalSession()
  // tabs.value[tabIndex].session = session

  // 处理输入数据
  terminal.on('data', (data) => {
    // 这里需要将输入发送到会话
    if (tabItem.session) {
      tabItem.session.write(data)
    } else {
      // 如果没有会话，回显输入数据
      terminal.write(data)
    }
  })
}

// 激活标签
function activateTab(tabId: string) {
  tabs.value.forEach((tab) => {
    tab.active = tab.id === tabId

    // 激活对应会话
    if (tab.active && tab.session) {
      sessionManager.value.activateSession(tab.session.id)
    }
  })
}

// 关闭标签
function closeTab(tabId: string) {
  const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
  if (tabIndex === -1)
    return

  const tabItem = tabs.value[tabIndex]

  // 清理资源
  if (tabItem.terminalInstance) {
    tabItem.terminalInstance.dispose()
  }

  // 关闭会话
  if (tabItem.session) {
    sessionManager.value.removeSession(tabItem.session.id)
  }

  // 从数组中移除
  tabs.value.splice(tabIndex, 1)

  // 如果关闭的是当前激活的标签，则激活下一个可用标签
  if (tabItem.active && tabs.value.length > 0) {
    const nextTabIndex = Math.min(tabIndex, tabs.value.length - 1)
    tabs.value[nextTabIndex].active = true
  }

  // 如果没有标签，创建一个新标签
  if (tabs.value.length === 0) {
    createTab()
  }
}

// 会话管理器事件处理
function setupSessionEvents() {
  sessionManager.value.on('session-activated', (session) => {
    console.log('会话已激活:', session?.id)
  })

  sessionManager.value.on('session-removed', (sessionId) => {
    console.log('会话已移除:', sessionId)
  })
}

// 初始化页面
onMounted(() => {
  setupSessionEvents()

  // 创建初始标签
  createTab()
})

// 清理资源
onBeforeUnmount(() => {
  // 清理所有终端实例
  tabs.value.forEach((tab) => {
    if (tab.terminalInstance) {
      tab.terminalInstance.dispose()
    }
  })

  // 清理会话管理器
  sessionManager.value.dispose()
})
</script>

<template>
  <div class="terminal-tabs-container">
    <!-- 标签栏 -->
    <div class="terminal-tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="terminal-tab"
        :class="{ 'active-tab': tab.active }"
        @click="activateTab(tab.id)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <button class="tab-close" @click.stop="closeTab(tab.id)">
          ×
        </button>
      </div>

      <button class="new-tab-button" @click="createTab()">
        +
      </button>
    </div>

    <!-- 终端容器 -->
    <div class="terminal-tabs-content">
      <div
        v-for="tab in tabs"
        :id="`terminal-${tab.id}`"
        :key="tab.id"
        class="terminal-container"
        :class="{ 'active-terminal': tab.active }"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal-tabs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #fff;
}

.terminal-tabs-header {
  display: flex;
  height: 36px;
  background-color: #252526;
  border-bottom: 1px solid #3f3f3f;
  overflow-x: auto;
  white-space: nowrap;
}

.terminal-tab {
  display: flex;
  align-items: center;
  padding: 0 10px;
  min-width: 120px;
  height: 36px;
  background-color: #2d2d2d;
  margin-right: 1px;
  cursor: pointer;
  user-select: none;
}

.active-tab {
  background-color: #1e1e1e;
  border-top: 2px solid #007acc;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  margin-left: 8px;
  padding: 0;
  width: 16px;
  height: 16px;
  line-height: 14px;
  text-align: center;
}

.tab-close:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.new-tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
}

.new-tab-button:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.terminal-tabs-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.terminal-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  background-color: #000;
}

.active-terminal {
  display: block;
}
</style>
