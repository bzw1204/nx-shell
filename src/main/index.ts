import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import IPCService from './service/ipc-service'

function createWindow() {
  console.log('main-path', join(__dirname, '../../preload/index.js'))
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.send('test-send', 'hello,main')
  })

  // 屏蔽F11快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      event.preventDefault()
    }
  })

  // 发送窗口最大化事件
  mainWindow.on('maximize', () => {})

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  // 窗口最大化/重置事件
  ipcMain.handle('toggleMaximize', () => {
    const isMaximized = mainWindow.isMaximized()
    mainWindow[!isMaximized ? 'maximize' : 'restore']()
    return !isMaximized
  })
  // 窗口最小化事件
  ipcMain.handle('minimize', () => {
    const isMinimized = mainWindow.isMinimized()
    !isMinimized && mainWindow.minimize()
  })

  // 窗口关闭事件
  ipcMain.handle('close', () => {
    mainWindow.close()
  })
  return mainWindow
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors') // 允许跨域
app.commandLine.appendSwitch('ignore-certificate-errors') // 忽略证书相关错误
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.nxshell')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createWindow()
  new IPCService(win)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
