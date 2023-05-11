import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getGist, createGist, updateGist } from './gist'

// Custom APIs for renderer
const api: IApi = {
  platform: process.platform
}

const tools: ITools = {
  toggleMaximize: async function (): Promise<boolean> {
    return await ipcRenderer.invoke('toggleMaximize')
  },
  minimize: async function (): Promise<void> {
    await ipcRenderer.invoke('minimize')
  },
  close: async function (): Promise<void> {
    await ipcRenderer.invoke('close')
  },
  getGist,
  createGist,
  updateGist
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('tools', tools)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.tools = tools
}
ipcRenderer.on('test-send', (_event, arg) => {
  console.log(arg)
})
