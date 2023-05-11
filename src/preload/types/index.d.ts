import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface ITools {
    toggleMaximize: () => Promise<boolean>
    minimize: () => Promise<void>
    close: () => Promise<void>
    getGist: (token, gistId) => Promise<any>
    createGist: (token, options) => Promise<any>
    updateGist: (token, gistId, files) => Promise<any>
  }
  interface IApi {
    platform: Platform
  }
  interface Window {
    electron: ElectronAPI
    api: IApi
    tools: ITools
  }
}
