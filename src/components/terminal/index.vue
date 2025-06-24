<script setup lang="ts">
import type { IDockviewPanel } from 'dockview-vue'
import type { TerminalSession } from 'terminal'
import { NxTerminal } from './index'
import { TerminalSessionManager } from './session-manager'

const { params } = defineProps<{
  params: IDockviewPanel
}>()
const terminalContainer = useTemplateRef('terminal-container')
const sessionManager = ref<TerminalSessionManager>(new TerminalSessionManager())
async function initTerminal(tabId: string, _sessionType: 'local' | 'ssh' = 'local', config?: any) {
  // 缓存当前命令内容
  let currentCommand = ''
  // 创建终端实例
  const terminal = new NxTerminal({
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    cursorBlink: true,
    cursorStyle: 'underline'
  })
  if (!terminalContainer.value) {
    return
  }

  // 打开终端
  terminal.openTerminal(terminalContainer.value)
  terminal.writeln('正在连接到会话...')

  // 确保终端接收焦点
  terminalContainer.value.addEventListener('click', () => {
    terminal.focus()
    console.log('容器点击，终端获得焦点')
  })

  try {
    // 使用传入的配置或默认配置
    const localConfig = config || {
      type: 'local',
      shell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
      name: 'Local Terminal'
    }
    const session: TerminalSession = await sessionManager.value.createLocalSession(localConfig)
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
        terminalContainer.value?.appendChild(reconnectBtn)
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
watchEffect(() => {
  initTerminal(params.api.id, 'local')
})
console.log('初始化终端:', params?.params, params.api.id)
</script>

<template>
  <div ref="terminal-container" class="wh-full flex flex-col" />
</template>
