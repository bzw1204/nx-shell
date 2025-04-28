declare module 'ns-session' {
  type SessionType = 'ssh' | 'ftp' | 'sftp' | 'telnet' | 'webdav' | 'vnc' | 'serial' | 'local'

  interface ISession {
    id: string // 每个会话的唯一标识
    type: SessionType // 会话类型，用于区分不同协议
    terminal: import('@xterm/xterm').Terminal // 终端实例，集成了 xterm.js
    onData?: (data: string) => void // 数据输出的回调函数

    // 建立连接
    connect: () => Promise<void>
    // 断开连接
    disconnect: () => Promise<void>
    // 发送指令
    sendCommand: (command: string) => Promise<void>

    // 初始化终端，配置 xterm.js 终端实例
    initializeTerminal: (options?: import('@xterm/xterm').ITerminalOptions) => void
    // 处理终端输出，通常由后台进程返回的数据
    handleOutput: (data: string) => void
    // 处理终端输入，通常由用户通过 xterm.js 发送的输入
    handleInput: (input: string) => void
    // 监听终端的事件，例如光标移动、大小改变等
    listenToTerminalEvents: () => void

    // 可选：实现复制/克隆
    clone?: () => ISession

    // 销毁终端实例
    destroyTerminal: () => void
  }

  interface ISessionConfig {
    host: string
    port: number
    username: string
    password?: string
    privateKey?: import('node:buffer').Buffer | string
    name?: string
    type: SessionType
  }

  interface ILocalSessionConfig {
    type: SessionType
    shellPath: string
    args?: string[]
  }
}
