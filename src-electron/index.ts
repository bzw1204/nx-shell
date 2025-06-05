import { release } from 'node:os'
import { createWindow } from '@/core/window-manager'
import { initStoreIpc } from '@/store'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { useUIKit } from '@electron-uikit/core/main'
import { registerTitleBarListener } from '@electron-uikit/titlebar'
import { app, BrowserWindow } from 'electron'
import logger from 'electron-log'
import { IpcExchange } from './session/ipc-exchange'
import { SessionManager } from './session/manager'

// 关闭安全提示
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
// 忽略证书相关错误
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors') // 允许跨域
// win7下禁用gpu加速
if (release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

// 初始化会话管理器和IPC交换机
const sessionManager = new SessionManager()
const ipcExchange = new IpcExchange(sessionManager)

app.whenReady().then(async() => {
  electronApp.setAppUserModelId('com.github.bzw1204.nxshell')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  initStoreIpc()
  useUIKit()
  registerTitleBarListener()
  const mainWindow = await createWindow()

  // 设置IPC交换机的主窗口
  ipcExchange.setMainWindow(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 此处防止子进程以外推出导致APP异常跟随退出
process.on('uncaughtException', error => logger.error('uncaughtException', error.message))
process.on('unhandledRejection', (reason: Error, promise) => logger.error('Unhandled rejection:', reason.message, promise))
process.on('uncaughtExceptionMonitor', error => logger.error('uncaughtExceptionMonitor', error.message))
