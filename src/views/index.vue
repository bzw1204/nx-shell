<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import TerminalTabs from '@/components/terminal/terminal-tabs.vue'
import { DragContainer } from '@/layouts'
import { NIcon } from 'naive-ui'
import { h, onMounted, onUnmounted, ref } from 'vue'

// 定义类型
type Platform = typeof process.platform
type Architecture = typeof process.arch

interface SystemInfo {
  platform: Platform
  arch: Architecture
  version: string
  memoryUsage?: string
}

// 创建图标渲染函数
function renderIcon(iconName: string) {
  return () => h(NIcon, null, {
    default: () => {
      // 基于图标名称返回SVG图标
      if (iconName === 'terminal') {
        return h('svg', {
          'xmlns': 'http://www.w3.org/2000/svg',
          'width': '16',
          'height': '16',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('polyline', { points: '4,17 10,11 4,5' }),
          h('line', { x1: '12', y1: '19', x2: '20', y2: '19' })
        ])
      } else if (iconName === 'cloud') {
        return h('svg', {
          'xmlns': 'http://www.w3.org/2000/svg',
          'width': '16',
          'height': '16',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' })
        ])
      } else if (iconName === 'info') {
        return h('svg', {
          'xmlns': 'http://www.w3.org/2000/svg',
          'width': '16',
          'height': '16',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
          h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
        ])
      } else if (iconName === 'close') {
        return h('svg', {
          'xmlns': 'http://www.w3.org/2000/svg',
          'width': '16',
          'height': '16',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
          h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
        ])
      }
      return null
    }
  })
}

// 应用状态
const appState = ref({
  status: 'ready',
  version: 'v1.0.0',
  environment: process.platform
})

// 控制显示的组件
const activeSection = ref<'terminal' | 'settings' | 'dragLayout'>('terminal')

// 切换显示的部分
function switchSection(section: 'terminal' | 'settings' | 'dragLayout') {
  activeSection.value = section
}

// 终端配置
const terminalConfig = ref({
  fontSize: 14,
  fontFamily: 'JetBrains Mono, monospace',
  theme: 'dark'
})

// 系统信息
const systemInfo = ref<SystemInfo>({
  platform: process.platform,
  arch: process.arch,
  version: process.version
})

let statusCheckInterval: number | null = null

// 定期检查系统状态
function startStatusCheck() {
  statusCheckInterval = window.setInterval(() => {
    // 这里可以添加定期检查系统状态的逻辑
    // 例如检查后端服务、会话状态等
    const memoryUsage = process.memoryUsage?.()
    if (memoryUsage) {
      systemInfo.value = {
        ...systemInfo.value,
        memoryUsage: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
      }
    }
  }, 5000) as unknown as number
}

// 组件挂载和卸载
onMounted(() => {
  startStatusCheck()
})

onUnmounted(() => {
  if (statusCheckInterval !== null) {
    clearInterval(statusCheckInterval)
  }
})

// 关于信息
const appInfo = {
  name: 'NxShell',
  description: '现代化的跨平台终端工具',
  repository: 'https://github.com/username/nxshell',
  license: 'MIT'
}

// 菜单选项 - 使用正确的DropdownOption类型
const menuOptions: DropdownOption[] = [
  { label: '新建本地会话', key: 'new-local', icon: renderIcon('terminal') },
  { label: '新建SSH会话', key: 'new-ssh', icon: renderIcon('cloud') },
  { label: '关于', key: 'about', icon: renderIcon('info') },
  { type: 'divider' },
  { label: '退出', key: 'exit', icon: renderIcon('close') }
]

// 创建新会话的对话框控制
const newSessionModalVisible = ref(false)
const sessionType = ref<'local' | 'ssh'>('local')
const sessionForm = ref({
  local: {
    name: '本地终端',
    shell: process.platform === 'win32' ? 'powershell.exe' : 'bash'
  },
  ssh: {
    name: 'SSH会话',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: ''
  }
})

// 显示创建新会话对话框
function showNewSessionModal(type: 'local' | 'ssh') {
  sessionType.value = type
  newSessionModalVisible.value = true
}

// 创建新会话
function createNewSession() {
  // 这里将通过 terminal-tabs 组件的方法创建新会话
  // 具体实现已在 terminal-tabs.vue 中
  newSessionModalVisible.value = false
}

// 处理菜单选择
function handleMenuSelect(key: string) {
  if (key === 'new-local') {
    showNewSessionModal('local')
  } else if (key === 'new-ssh') {
    showNewSessionModal('ssh')
  } else if (key === 'exit') {
    // 在Electron环境中退出应用程序
    if (window.ipc) {
      window.ipc.send('app:quit')
    }
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="app-title">
        <!-- 修复图片路径 -->
        <span class="app-logo">NX</span>
        <h1>NxShell</h1>
      </div>
      <nav class="app-nav">
        <n-button-group>
          <n-button
            :type="activeSection === 'terminal' ? 'primary' : 'default'"
            @click="switchSection('terminal')"
          >
            终端
          </n-button>
          <n-button
            :type="activeSection === 'settings' ? 'primary' : 'default'"
            @click="switchSection('settings')"
          >
            设置
          </n-button>
          <n-button
            :type="activeSection === 'dragLayout' ? 'primary' : 'default'"
            @click="switchSection('dragLayout')"
          >
            布局
          </n-button>
        </n-button-group>
      </nav>
      <div class="app-controls">
        <n-dropdown
          trigger="click"
          :options="menuOptions"
          @select="handleMenuSelect"
        >
          <n-button quaternary circle>
            <template #icon>
              <NIcon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </NIcon>
            </template>
          </n-button>
        </n-dropdown>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="app-main">
      <!-- 终端标签页 -->
      <div v-show="activeSection === 'terminal'" class="app-section">
        <TerminalTabs class="full-height" />
      </div>

      <!-- 设置页面 -->
      <div v-show="activeSection === 'settings'" class="app-section settings-section">
        <n-card title="终端设置" class="settings-card">
          <n-space vertical>
            <n-form-item label="字体大小">
              <n-input-number v-model:value="terminalConfig.fontSize" :min="8" :max="32" />
            </n-form-item>
            <n-form-item label="字体">
              <n-select
                v-model:value="terminalConfig.fontFamily"
                :options="[
                  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
                  { label: 'Consolas', value: 'Consolas, monospace' },
                  { label: 'Courier New', value: 'Courier New, monospace' },
                ]"
              />
            </n-form-item>
            <n-form-item label="主题">
              <n-select
                v-model:value="terminalConfig.theme"
                :options="[
                  { label: '深色', value: 'dark' },
                  { label: '浅色', value: 'light' },
                ]"
              />
            </n-form-item>
          </n-space>
        </n-card>

        <n-card title="系统信息" class="settings-card">
          <n-descriptions bordered :column="1">
            <n-descriptions-item label="平台">
              {{ systemInfo.platform }}
            </n-descriptions-item>
            <n-descriptions-item label="架构">
              {{ systemInfo.arch }}
            </n-descriptions-item>
            <n-descriptions-item label="Node版本">
              {{ systemInfo.version }}
            </n-descriptions-item>
            <n-descriptions-item v-if="systemInfo.memoryUsage" label="内存使用">
              {{ systemInfo.memoryUsage }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="关于" class="settings-card">
          <n-descriptions bordered :column="1">
            <n-descriptions-item label="应用名称">
              {{ appInfo.name }}
            </n-descriptions-item>
            <n-descriptions-item label="描述">
              {{ appInfo.description }}
            </n-descriptions-item>
            <n-descriptions-item label="仓库">
              {{ appInfo.repository }}
            </n-descriptions-item>
            <n-descriptions-item label="许可证">
              {{ appInfo.license }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </div>

      <!-- 拖拽布局部分 -->
      <div v-show="activeSection === 'dragLayout'" class="app-section">
        <DragContainer class="full-height" />
      </div>
    </main>

    <!-- 状态栏 -->
    <footer class="app-footer">
      <div class="status-indicator" :class="appState.status">
        <span class="status-dot" />
        <span>{{ appState.status }}</span>
      </div>
      <div class="version-info">
        {{ appState.version }}
      </div>
      <div class="env-info">
        {{ appState.environment }}
      </div>
    </footer>

    <!-- 创建新会话的对话框 -->
    <n-modal
      v-model:show="newSessionModalVisible"
      :title="sessionType === 'local' ? '创建本地会话' : '创建SSH会话'"
      preset="dialog"
      positive-text="创建"
      negative-text="取消"
      @positive-click="createNewSession"
      @negative-click="newSessionModalVisible = false"
    >
      <!-- 本地会话表单 -->
      <div v-if="sessionType === 'local'">
        <n-form label-placement="left">
          <n-form-item label="会话名称">
            <n-input v-model:value="sessionForm.local.name" placeholder="本地终端" />
          </n-form-item>
          <n-form-item label="Shell">
            <n-input v-model:value="sessionForm.local.shell" placeholder="bash 或 powershell.exe" />
          </n-form-item>
        </n-form>
      </div>

      <!-- SSH会话表单 -->
      <div v-else>
        <n-form label-placement="left">
          <n-form-item label="会话名称">
            <n-input v-model:value="sessionForm.ssh.name" placeholder="SSH会话" />
          </n-form-item>
          <n-form-item label="主机">
            <n-input v-model:value="sessionForm.ssh.host" placeholder="例如: example.com 或 192.168.1.100" />
          </n-form-item>
          <n-form-item label="端口">
            <n-input-number v-model:value="sessionForm.ssh.port" :min="1" :max="65535" placeholder="22" />
          </n-form-item>
          <n-form-item label="用户名">
            <n-input v-model:value="sessionForm.ssh.username" placeholder="用户名" />
          </n-form-item>
          <n-form-item label="密码">
            <n-input
              v-model:value="sessionForm.ssh.password"
              type="password"
              placeholder="密码"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item v-if="!sessionForm.ssh.password" label="私钥">
            <n-input v-model:value="sessionForm.ssh.privateKey" type="textarea" placeholder="私钥内容" />
          </n-form-item>
        </n-form>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--background-color, #1e1e1e);
  color: var(--text-color, #f0f0f0);
}

.app-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  background-color: var(--header-bg, #252526);
  border-bottom: 1px solid var(--border-color, #333);
}

.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-logo {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: #007acc;
  border-radius: 4px;
  font-size: 12px;
}

.app-title h1 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.app-nav {
  margin-left: 24px;
  flex: 1;
}

.app-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.full-height {
  height: 100%;
  width: 100%;
}

.settings-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
}

.settings-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.app-footer {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 28px;
  background-color: var(--footer-bg, #007acc);
  color: var(--footer-color, white);
  font-size: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4caf50;
}

.status-indicator.error .status-dot {
  background-color: #f44336;
}

.status-indicator.loading .status-dot {
  background-color: #ff9800;
}

.version-info {
  margin-left: auto;
  margin-right: 16px;
}

.env-info {
  margin-left: 16px;
}
</style>
