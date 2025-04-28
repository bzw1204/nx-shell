declare module 'ns-plugin' {
  interface NsPlugin {
    name: string
    // 在插件初始化时调用，你可以传入当前项目的上下文对象（例如 SSHManager 实例、IPC通讯对象等）
    initialize: (context: any) => Promise<void> | void
    // 可选：当应用退出前，插件可以清理资源
    dispose?: () => Promise<void> | void
    // 可选：插件可以监听事件，例如 SSH 连接成功、SFTP 操作完成等
    onEvent?: (event: string, data: any) => void
  }

}
