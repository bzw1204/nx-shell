import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface ITools {
    toggleMaximize: () => Promise<boolean>
    minimize: () => Promise<void>
    close: () => Promise<void>
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
