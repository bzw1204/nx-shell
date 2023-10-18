import { is } from '@electron-toolkit/utils'
import { BrowserWindow, WebContents, app, ipcMain } from 'electron'
import { getFonts } from 'font-list'
import { join } from 'path'
import { EventEmitter } from 'stream'

export default class IPCService extends EventEmitter {
  message: WebContents
  constructor(win: BrowserWindow) {
    super()
    this.message = win.webContents
    ipcMain.handle('font-list', async () => {
      return await this.getSystemFontList()
    })
    ipcMain.handle('app-version', () => {
      return app.getVersion()
    })
    ipcMain.handle('shell', () => {
      return process.env
    })
    ipcMain.handle('explorer', (_, params: any) => {
      this.openExplorerWindow()
    })
  }
  openExplorerWindow() {
    console.log('path', join(__dirname, '../../preload/index.js'))
    const mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        // preload: join(__dirname, '../../preload/index.js'),
        sandbox: false
      }
    })
    // 屏蔽F11快捷键
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F11') {
        event.preventDefault()
      }
    })
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      console.log('load-router', `${process.env['ELECTRON_RENDERER_URL']}/#/explorer`)
      mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/explorer`)
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'explorer' })
    }
    // // 窗口最大化/重置事件
    // ipcMain.handle('toggleMaximize', () => {
    //   const isMaximized = mainWindow.isMaximized()
    //   mainWindow[!isMaximized ? 'maximize' : 'restore']()
    //   return !isMaximized
    // })
    // // 窗口最小化事件
    // ipcMain.handle('minimize', () => {
    //   const isMinimized = mainWindow.isMinimized()
    //   !isMinimized && mainWindow.minimize()
    // })

    // 窗口关闭事件
    // ipcMain.handle('close', () => {
    //   mainWindow.close()
    // })
    return mainWindow
  }
  async getSystemFontList() {
    try {
      const fontList = await getFonts()
      return fontList.map((x) => {
        return {
          label: x.replaceAll('"', ''),
          value: x
        }
      })
    } catch (error) {
      return []
    }
  }
}
