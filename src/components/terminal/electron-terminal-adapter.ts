import type { LocalTerminalOptions, SshTerminalOptions, TerminalSession, TerminalSessionType } from 'terminal'

/**
 * 基于Electron IPC的终端会话实现
 * 用于连接前端TerminalSession接口与后端会话处理
 */
export class ElectronTerminalSession implements TerminalSession {
  id: string
  type: TerminalSessionType
  name: string
  isConnected: boolean = false

  private dataCallbacks: ((data: string) => void)[] = []
  private exitCallbacks: ((code: number, signal?: string) => void)[] = []

  constructor(id: string, type: TerminalSessionType, name: string = '') {
    this.id = id
    this.type = type
    this.name = name || `${type.charAt(0).toUpperCase() + type.slice(1)} Terminal`

    // 监听来自后端的数据
    window.ipc.on(`session:data`, (_event, data) => {
      if (data && data.id === this.id) {
        console.log(`接收会话 ${this.id} 数据:`, data.data.length > 20 ? `${data.data.substring(0, 20)}...` : data.data)
        this.dataCallbacks.forEach(callback => callback(data.data))
      }
    })

    // 监听会话退出事件
    window.ipc.on(`session:exit`, (_event, data) => {
      if (data && data.id === this.id) {
        console.log(`会话 ${this.id} 退出`, data.code, data.signal)
        this.isConnected = false
        this.exitCallbacks.forEach(callback => callback(data.code || 0, data.signal))
      }
    })

    console.log(`创建会话 ${id} (${type})`)
  }

  async connect(): Promise<void> {
    try {
      console.info(`尝试连接到会话 ${this.id}`)

      // 添加超时处理，避免连接操作卡住
      const connectPromise = window.ipc.invoke('session:connect', this.id)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`会话连接请求超时: ${this.id}`))
        }, 8000) // 8秒超时，略长于后端超时
      })

      await Promise.race([connectPromise, timeoutPromise])
      console.info(`成功连接到会话 ${this.id}`)
      this.isConnected = true
    } catch (error) {
      console.error(`连接会话失败 (${this.id}):`, error)
      this.isConnected = false // 确保连接状态被正确更新
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.info(`会话 ${this.id} 未连接，无需断开连接`)
      return
    }

    try {
      console.info(`断开会话 ${this.id} 连接`)
      await window.ipc.invoke('session:disconnect', this.id)
      this.isConnected = false
    } catch (error) {
      console.error(`断开会话失败 (${this.id}):`, error)
    }
  }

  write(data: string): void {
    if (!this.isConnected) {
      console.warn(`无法发送数据到会话 ${this.id}，会话未连接`)
      return
    }

    // 记录原始数据和十六进制表示，用于调试
    const formattedData = data.length > 20
      ? `${data.substring(0, 20)}...`
      : data.replace(/[\r\n]/g, match => match === '\r' ? '\\r' : '\\n')
    const hexData = Array.from(data).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
    console.log(`写入数据到会话 ${this.id}: "${formattedData}" (hex: ${hexData})`)

    // 特殊字符处理 - 与后端的node-pty兼容
    let processedData = data

    // 处理特殊序列
    if (data === '\r' || data === '\r\n') {
      processedData = '\r' // node-pty期望只收到\r

      // 确保回车信号能被接收 - 使用直接调用，确保同步执行
      try {
        console.log(`发送回车命令到会话 ${this.id}`)

        // 只使用一种方式发送回车命令，避免重复
        window.ipc.send('session:input', this.id, processedData)

        console.log(`${this.id} 发送回车命令成功`)
      } catch (err) {
        console.error(`发送回车命令失败:`, err)
      }

      return // 直接返回，因为已经发送数据
    }
    // 处理退格键 (ASCII 127/DEL 或 \b)
    else if (data === '\x7F' || data === '\b') {
      console.log('处理退格键：确保node-pty能正确识别')
      // 直接传递退格字符，确保node-pty能正确识别
      processedData = '\x7F' // 使用DEL字符，大多数shell都兼容
    }
    // 处理控制字符
    else if (data.length === 1 && data.charCodeAt(0) < 32) {
      const ctrlCode = data.charCodeAt(0)
      console.log(`处理控制字符: 0x${ctrlCode.toString(16).padStart(2, '0')} (${ctrlCode})`)
    }
    // 可视化ANSI序列便于调试
    else if (data.startsWith('\x1B')) {
      const hexCodes = Array.from(data)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ')
      console.info(`处理ANSI序列: ${hexCodes}`)
    }

    // 使用非invoke方法发送数据，无需等待响应
    try {
      window.ipc.send('session:input', this.id, processedData)
    } catch (err) {
      console.error(`向会话 ${this.id} 发送数据失败:`, err)
    }
  }

  resize(cols: number, rows: number): void {
    if (!this.isConnected) {
      console.warn(`无法调整会话 ${this.id} 大小，会话未连接`)
      return
    }

    window.ipc.invoke('terminal:resize', this.id, cols, rows).catch((err) => {
      console.error(`调整终端大小失败 (${this.id}):`, err)
    })
  }

  onData(callback: (data: string) => void): void {
    this.dataCallbacks.push(callback)
  }

  onExit(callback: (code: number, signal?: string) => void): void {
    this.exitCallbacks.push(callback)
  }

  dispose(): void {
    this.disconnect()
    this.dataCallbacks = []
    this.exitCallbacks = []
  }
}

/**
 * 实现TerminalSessionManager的子类，与Electron IPC交互
 */
export class ElectronTerminalAdapter {
  /**
   * 创建本地终端会话
   */
  static async createLocalSession(options: LocalTerminalOptions): Promise<ElectronTerminalSession> {
    try {
      // 创建会话配置
      const config = {
        shellPath: options.shell || (process.platform === 'win32' ? 'powershell.exe' : 'bash'),
        args: options.args || [],
        type: 'local' as const,
        env: options.env,
        cwd: options.cwd
      }

      // 调用后端创建会话
      const sessionId = await window.ipc.invoke('session:create', 'local', config)
      // 创建前端会话对象
      const session = new ElectronTerminalSession(
        sessionId,
        'local',
        options.name || 'Local Terminal'
      )

      return session
    } catch (error) {
      console.error('创建本地会话失败:', error)
      throw error
    }
  }

  /**
   * 创建SSH终端会话
   */
  static async createSshSession(options: SshTerminalOptions): Promise<ElectronTerminalSession> {
    try {
      // 创建会话配置
      const config = {
        host: options.host,
        port: options.port || 22,
        username: options.username,
        password: options.password,
        privateKey: options.privateKey,
        type: 'ssh' as const
      }

      // 调用后端创建会话
      const sessionId = await window.ipc.invoke('session:create', 'ssh', config)

      // 创建前端会话对象
      const session = new ElectronTerminalSession(
        sessionId,
        'ssh',
        options.name || `SSH: ${options.username}@${options.host}`
      )

      return session
    } catch (error) {
      console.error('创建SSH会话失败:', error)
      throw error
    }
  }

  /**
   * 获取所有会话
   */
  static async listSessions(): Promise<{ id: string, type: string }[]> {
    try {
      const sessions = await window.ipc.invoke('session:list')
      console.info('获取会话列表成功:', sessions)
      return sessions
    } catch (error) {
      console.error('获取会话列表失败:', error)
      return []
    }
  }
}
