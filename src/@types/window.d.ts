interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  send: (channel: string, ...args: any[]) => void
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
  removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => void
}

interface Window {
  ipc: IpcRenderer
  process: {
    platform: string
    arch: string
    version: string
    memoryUsage?: () => {
      heapUsed: number
      heapTotal: number
      rss: number
      external: number
    }
  }
}
