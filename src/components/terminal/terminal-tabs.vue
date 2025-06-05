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
const tabs = ref<TabItem[]>([])
const sessionManager = ref<TerminalSessionManager>(new TerminalSessionManager())

// 创建新标签
async function createTab(title: string = '终端', sessionType: 'local' | 'ssh' = 'local') {
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
  setTimeout(async() => {
    await initTerminal(newTab.id, sessionType)
  }, 50)

  return newTab
}

// 初始化终端和会话
async function initTerminal(tabId: string, sessionType: 'local' | 'ssh' = 'local') {
  const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
  if (tabIndex === -1)
    return

  const tabItem = tabs.value[tabIndex]
  const terminalContainer = document.getElementById(`terminal-${tabId}`)
  if (!terminalContainer)
    return

  // 缓存当前命令内容
  let currentCommand = ''

  // 确保容器可以获取焦点
  terminalContainer.tabIndex = 0

  // 创建终端实例
  const terminal = new NxTerminal({
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    cursorBlink: true,
    cursorStyle: 'underline'
  })

  // 打开终端
  terminal.openTerminal(terminalContainer as HTMLElement)
  terminal.writeln('正在连接到会话...')

  // 确保终端接收焦点
  terminalContainer.addEventListener('click', () => {
    terminal.focus()
    console.log('容器点击，终端获得焦点')
  })

  // 保存终端实例
  tabs.value[tabIndex].terminalInstance = terminal

  try {
    let session: TerminalSession

    // 根据会话类型创建对应的会话
    if (sessionType === 'ssh') {
      // 这里可以添加SSH连接参数获取逻辑，例如弹出对话框
      session = await sessionManager.value.createSshSession({
        type: 'ssh',
        host: 'localhost', // 示例地址，实际使用时应从用户输入获取
        port: 22,
        username: 'user', // 示例用户名，实际使用时应从用户输入获取
        name: tabItem.title
      })
    } else {
      // 本地会话
      session = await sessionManager.value.createLocalSession({
        type: 'local',
        shell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
        name: tabItem.title
      })
    }

    // 保存会话引用
    tabs.value[tabIndex].session = session

    // 设置终端标题
    tabs.value[tabIndex].title = session.name

    // 调试信息：显示会话连接成功
    console.log(`会话 ${session.id} 初始化成功，名称: ${session.name}，类型: ${session.type}`)
    terminal.writeln(`\r\n\x1B[32m会话准备就绪，类型: ${session.type}\x1B[0m\r\n`)

    // 处理来自会话的数据输出
    session.onData((data) => {
      if (terminal) {
        console.log('从会话接收数据:', data.length > 50 ? `${data.substring(0, 50)}...` : data) // 调试日志
        terminal.write(data)
      }
    })

    // 监听会话退出
    session.onExit((code) => {
      terminal.writeln(`\r\n\x1B[31m会话已退出，退出码: ${code}\x1B[0m`)
      console.log('会话退出，退出码:', code) // 调试日志

      // 使用事件触发方式处理会话断开，避免使用confirm
      terminal.writeln('\r\n\x1B[33m会话已断开，点击此处重新连接\x1B[0m')

      // 在真实应用中，应当提供更优雅的UI重连方式
      // 这里我们可以标记会话状态，然后提供一个重连按钮
      const reconnectId = `reconnect-${tabId}`
      window.setTimeout(() => {
        const reconnectBtn = document.createElement('button')
        reconnectBtn.id = reconnectId
        reconnectBtn.textContent = '重新连接'
        reconnectBtn.style.margin = '5px'
        reconnectBtn.onclick = async() => {
          terminal.writeln('\r\n尝试重新连接...')
          try {
            await session.connect()
            terminal.writeln('\r\n\x1B[32m重新连接成功\x1B[0m')
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err)
            console.error('重新连接失败:', err)
            terminal.writeln(`\r\n\x1B[31m重新连接失败: ${errorMsg}\x1B[0m`)
          }
        }
        terminalContainer.appendChild(reconnectBtn)
      }, 100)
    })

    // 处理终端输入数据
    terminal.on('data', (data) => {
      if (session && session.isConnected) {
        console.log('发送数据到会话:', data, '当前积累的命令:', currentCommand)

        // 发送数据到会话，不做特殊处理
        session.write(data)

        // 更新命令缓存
        if (data === '\r') {
          // 回车键按下，清空命令缓存
          console.log('命令执行:', currentCommand)
          currentCommand = ''
        } else if (data === '\x7F') {
          // 退格键，删除最后一个字符
          if (currentCommand.length > 0) {
            currentCommand = currentCommand.slice(0, -1)
          }
        } else if (!data.startsWith('\x1B')) {
          // 不是控制序列，添加到命令缓存
          currentCommand += data
        }
      } else {
        console.warn('无法发送数据，会话未连接')
      }
    })

    // 处理终端大小变化
    terminal.on('resize', (dimensions) => {
      if (session && session.isConnected) {
        console.log('调整终端大小:', dimensions) // 调试日志
        session.resize(dimensions.cols, dimensions.rows)
      }
    })

    // 确保终端聚焦
    setTimeout(() => {
      terminal.focus()
    }, 100)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('创建会话失败:', err)
    terminal.writeln(`\r\n\x1B[31m创建会话失败: ${errorMsg}\x1B[0m`)
  }
}

// 创建SSH会话
async function createSshSession() {
  // 实际应用中这里应弹出对话框获取连接参数
  createTab('SSH终端', 'ssh')
}

// 激活标签
function activateTab(tabId: string) {
  tabs.value.forEach((tab) => {
    tab.active = tab.id === tabId

    // 激活对应会话
    if (tab.active && tab.session) {
      sessionManager.value.activateSession(tab.session.id)

      // 激活时聚焦到当前终端
      if (tab.terminalInstance) {
        setTimeout(() => {
          tab.terminalInstance!.focus()
          console.log('标签激活，终端获得焦点')
        }, 10)
      }
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

  // 初始化会话管理器，加载已有会话
  sessionManager.value.initialize().catch((err) => {
    console.error('初始化会话管理器失败:', err)
  })
}

// 初始化页面
onMounted(() => {
  setupSessionEvents()
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
  <div class=":uno: terminal-tabs-container">
    <!-- 标签栏 -->
    <div class=":uno: terminal-tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class=":uno: terminal-tab"
        :class="{ ':uno: active-tab': tab.active }"
        @click="activateTab(tab.id)"
      >
        <span class=":uno: tab-title">{{ tab.title }}</span>
        <button class=":uno: tab-close" @click.stop="closeTab(tab.id)">
          ×
        </button>
      </div>

      <div class=":uno: tab-actions">
        <button class=":uno: action-button" @click="createTab('本地终端', 'local')">
          + 本地
        </button>
        <button class=":uno: action-button" @click="createSshSession">
          + SSH
        </button>
      </div>
    </div>

    <!-- 终端容器 -->
    <div class=":uno: terminal-tabs-content">
      <div
        v-for="tab in tabs"
        :id="`terminal-${tab.id}`"
        :key="tab.id"
        class=":uno: terminal-container"
        :class="{ ':uno: active-terminal': tab.active }"
        tabindex="0"
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
  overflow: hidden;
}

.terminal-tabs-header {
  display: flex;
  background-color: #252526;
  border-bottom: 1px solid #333;
  user-select: none;
  height: 36px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.terminal-tab {
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  height: 36px;
  border-right: 1px solid #333;
  cursor: pointer;
  color: #ccc;
  background-color: #2d2d2d;
}

.active-tab {
  background-color: #1e1e1e;
  color: #fff;
  border-bottom: 2px solid #0078d4;
}

.tab-title {
  margin-right: 8px;
}

.tab-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.tab-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding: 0 10px;
}

.action-button {
  background-color: #333;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 5px;
  border-radius: 3px;
  font-size: 12px;
}

.action-button:hover {
  background-color: #444;
  color: #fff;
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
  outline: none; /* 移除焦点时的轮廓 */
}

.active-terminal {
  display: block;
}
</style>
