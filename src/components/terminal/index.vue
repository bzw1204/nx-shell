<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NxTerminal } from './index'
import '@xterm/xterm/css/xterm.css'

const containerElement = ref<HTMLDivElement>()
const terminalInstance = ref<NxTerminal | null>(null)

// 创建并配置终端
function initTerminal() {
  if (!containerElement.value)
    return

  // 创建终端实例
  terminalInstance.value = new NxTerminal({
    fontSize: 14,
    fontFamily: 'monospace',
    cursorBlink: true,
    cursorStyle: 'underline'
  }, {
    'Alt+=': event => terminalInstance.value?.zoomIn(event),
    'Alt+-': event => terminalInstance.value?.zoomOut(event),
    'Alt+0': event => terminalInstance.value?.resetFontSize(event)
  })

  // 打开终端
  terminalInstance.value.openTerminal(containerElement.value)

  // 写入欢迎信息
  terminalInstance.value.writeln('Hello from NxShell Terminal')
  terminalInstance.value.writeln('Type something or click the buttons below to test')

  // 监听事件
  terminalInstance.value.on('data', (data) => {
    console.log('Terminal data:', data)
    // 这里可以处理终端输入，例如发送到后端服务
    // 简单的回显功能
    terminalInstance.value?.write(data)
  })
}

// 清理终端
function disposeTerminal() {
  if (terminalInstance.value) {
    terminalInstance.value.dispose()
    terminalInstance.value = null
  }
}

// 测试命令
function testCommand(command: string) {
  if (terminalInstance.value) {
    terminalInstance.value.writeln(`\r\n\x1B[33m执行命令: ${command}\x1B[0m`)

    // 模拟命令执行
    setTimeout(() => {
      if (command === 'help') {
        terminalInstance.value?.writeln('\r\n可用命令:')
        terminalInstance.value?.writeln('  help - 显示帮助信息')
        terminalInstance.value?.writeln('  ls - 列出文件')
        terminalInstance.value?.writeln('  date - 显示当前日期')
        terminalInstance.value?.writeln('  clear - 清空终端')
      } else if (command === 'ls') {
        terminalInstance.value?.writeln('\r\nMockFiles:')
        terminalInstance.value?.writeln('file1.txt  file2.js  folder1/  folder2/')
      } else if (command === 'date') {
        terminalInstance.value?.writeln(`\r\n${new Date().toLocaleString()}`)
      } else if (command === 'clear') {
        terminalInstance.value?.clear()
      } else {
        terminalInstance.value?.writeln(`\r\n命令未找到: ${command}`)
        terminalInstance.value?.writeln('输入 "help" 获取可用命令')
      }
      terminalInstance.value?.writeln('\r\n$ ')
    }, 300)
  }
}

// 清空终端
function clearTerminal() {
  if (terminalInstance.value) {
    terminalInstance.value.clear()
  }
}

onMounted(() => {
  initTerminal()
})

onUnmounted(() => {
  disposeTerminal()
})
</script>

<template>
  <div class="terminal-wrapper">
    <div id="terminalBox" class="terminal-container">
      <div id="terminal" ref="containerElement" class="terminal-instance" />
    </div>
    <n-flex class="terminal-controls no-drag" justify="center" align="center" gap="8">
      <n-button size="small" @click="testCommand('help')">
        Help
      </n-button>
      <n-button size="small" @click="testCommand('ls')">
        LS
      </n-button>
      <n-button size="small" @click="testCommand('date')">
        Date
      </n-button>
      <n-button size="small" @click="clearTerminal">
        Clear
      </n-button>
    </n-flex>
  </div>
</template>

<style scoped>
.terminal-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.terminal-container {
  flex: 1;
  background-color: #000;
  overflow: hidden;
}

.terminal-instance {
  width: 100%;
  height: 100%;
}

.terminal-controls {
  padding: 8px;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
}
</style>
