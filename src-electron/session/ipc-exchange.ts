import type { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import type { ILocalSessionConfig, ISession, ISessionConfig, SessionType } from 'ns-session'
import type { SessionManager } from './manager'
import { ipcMain } from 'electron'
import logger from 'electron-log'
import { LocalSession } from './local-session'
import { SshSession } from './ssh-session'

/**
 * IPC交换机 - 负责处理不同会话前后端的数据交互
 */
export class IpcExchange {
  private sessionManager: SessionManager
  private mainWindow?: BrowserWindow
  private outputBuffer: Map<string, { data: string[], timer?: NodeJS.Timeout }> = new Map()
  private readonly BATCH_SIZE = 10
  private readonly BATCH_TIMEOUT = 16 // 16ms ≈ 60fps

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager
    this.registerIPCHandlers()

    // 监听会话事件，转发给渲染进程
    this.sessionManager.on('sessionAdded', (session) => {
      this.sendToRenderer('session:added', {
        id: session.id,
        type: session.type
      })
    })

    this.sessionManager.on('sessionRemoved', (session) => {
      this.sendToRenderer('session:removed', {
        id: session.id
      })
      // 清理缓冲区
      this.clearOutputBuffer(session.id)
    })

    this.sessionManager.on('sessionSwitched', (session) => {
      this.sendToRenderer('session:switched', {
        id: session.id,
        type: session.type
      })
    })
  }

  /**
   * 设置主窗口，用于发送消息给渲染进程
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 清理输出缓冲区
   */
  private clearOutputBuffer(sessionId: string): void {
    const buffer = this.outputBuffer.get(sessionId)
    if (buffer?.timer) {
      clearTimeout(buffer.timer)
    }
    this.outputBuffer.delete(sessionId)
  }

  /**
   * 批量发送数据到渲染进程
   */
  private batchSendData(sessionId: string, data: string): void {
    let buffer = this.outputBuffer.get(sessionId)
    if (!buffer) {
      buffer = { data: [] }
      this.outputBuffer.set(sessionId, buffer)
    }

    buffer.data.push(data)

    // 如果缓冲区满了，立即发送
    if (buffer.data.length >= this.BATCH_SIZE) {
      this.flushBuffer(sessionId)
      return
    }

    // 设置定时器，确保数据不会延迟太久
    if (!buffer.timer) {
      buffer.timer = setTimeout(() => {
        this.flushBuffer(sessionId)
      }, this.BATCH_TIMEOUT)
    }
  }

  /**
   * 刷新缓冲区
   */
  private flushBuffer(sessionId: string): void {
    const buffer = this.outputBuffer.get(sessionId)
    if (!buffer || buffer.data.length === 0) {
      return
    }

    if (buffer.timer) {
      clearTimeout(buffer.timer)
      buffer.timer = undefined
    }

    // 合并数据并发送
    const combinedData = buffer.data.join('')
    buffer.data = []

    this.sendToRenderer('session:data', {
      id: sessionId,
      data: combinedData
    })
  }

  /**
   * 注册IPC处理器
   */
  private registerIPCHandlers(): void {
    // 会话管理
    ipcMain.handle('session:create', this.handleCreateSession.bind(this))
    ipcMain.handle('session:connect', this.handleConnectSession.bind(this))
    ipcMain.handle('session:disconnect', this.handleDisconnectSession.bind(this))
    ipcMain.handle('session:remove', this.handleRemoveSession.bind(this))
    ipcMain.handle('session:switch', this.handleSwitchSession.bind(this))
    ipcMain.handle('session:list', this.handleListSessions.bind(this))
    ipcMain.handle('session:clone', this.handleCloneSession.bind(this))

    // 数据传输
    ipcMain.handle('session:send-command', this.handleSendCommand.bind(this))
    ipcMain.on('session:input', this.handleSessionInput.bind(this))

    // 终端操作
    ipcMain.handle('terminal:resize', this.handleTerminalResize.bind(this))
  }

  /**
   * 发送数据到渲染进程（带重试机制）
   */
  private sendToRenderer(channel: string, data: any, retries: number = 3): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      logger.warn(`Cannot send message to renderer: ${channel}, window not available`)
      return
    }

    try {
      this.mainWindow.webContents.send(channel, data)
    } catch (error) {
      logger.error(`发送消息到渲染进程失败: ${channel}`, error)

      // 重试机制
      if (retries > 0) {
        setTimeout(() => {
          this.sendToRenderer(channel, data, retries - 1)
        }, 100)
      }
    }
  }

  /**
   * 根据会话类型和配置创建对应的会话实例
   */
  private createSessionInstance(type: SessionType, config: any): ISession {
    switch (type) {
      case 'local':
        return new LocalSession(config as ILocalSessionConfig)
      case 'ssh':
        return new SshSession(config as ISessionConfig)
      default:
        throw new Error(`不支持的会话类型: ${type}`)
    }
  }

  /**
   * 处理创建会话请求
   */
  private async handleCreateSession(_event: IpcMainInvokeEvent, type: SessionType, config: any): Promise<string> {
    try {
      const session = this.createSessionInstance(type, config)

      // 设置数据处理函数，使用批量发送
      session.onData = (data: string) => {
        this.batchSendData(session.id, data)
      }

      this.sessionManager.addSession(session)
      return session.id
    } catch (error) {
      logger.error('创建会话失败', error)
      throw error
    }
  }

  /**
   * 处理连接会话请求
   */
  private async handleConnectSession(_event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId)
    if (!session) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    try {
      // 添加超时处理，避免连接操作卡住
      const connectPromise = session.connect()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`会话连接超时: ${sessionId}`))
        }, 15000) // 15秒超时，给足够时间
      })

      await Promise.race([connectPromise, timeoutPromise])
      return true
    } catch (error) {
      logger.error(`连接会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理断开会话请求
   */
  private async handleDisconnectSession(_event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId)
    if (!session) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    try {
      await session.disconnect()
      this.clearOutputBuffer(sessionId)
      return true
    } catch (error) {
      logger.error(`断开会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理移除会话请求
   */
  private async handleRemoveSession(_event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> {
    try {
      this.sessionManager.removeSession(sessionId)
      this.clearOutputBuffer(sessionId)
      return true
    } catch (error) {
      logger.error(`移除会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理切换会话请求
   */
  private async handleSwitchSession(_event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> {
    try {
      this.sessionManager.switchSession(sessionId)
      return true
    } catch (error) {
      logger.error(`切换会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理获取会话列表请求
   */
  private async handleListSessions(): Promise<Array<{ id: string, type: SessionType }>> {
    try {
      const sessions = this.sessionManager.getAll()
      return sessions.map(session => ({
        id: session.id,
        type: session.type
      }))
    } catch (error) {
      logger.error('获取会话列表失败', error)
      throw error
    }
  }

  /**
   * 处理克隆会话请求
   */
  private async handleCloneSession(_event: IpcMainInvokeEvent, sessionId: string): Promise<string | null> {
    try {
      const newSession = this.sessionManager.cloneSession(sessionId)
      return newSession?.id || null
    } catch (error) {
      logger.error(`克隆会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理发送命令请求
   */
  private async handleSendCommand(_event: IpcMainInvokeEvent, sessionId: string, command: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId)
    if (!session) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    try {
      await session.sendCommand(command)
      return true
    } catch (error) {
      logger.error(`发送命令到会话 ${sessionId} 失败`, error)
      throw error
    }
  }

  /**
   * 处理会话输入（异步处理，避免阻塞）
   */
  private handleSessionInput(_event: IpcMainEvent, sessionId: string, data: string): void {
    // 异步处理，避免阻塞IPC主线程
    setImmediate(async() => {
      const session = this.sessionManager.getSession(sessionId)
      if (!session) {
        logger.warn(`无法处理输入：会话不存在 ${sessionId}`)
        return
      }

      try {
        await session.handleInput(data)
      } catch (error) {
        logger.error(`处理会话 ${sessionId} 输入失败`, error)
      }
    })
  }

  /**
   * 处理终端大小调整
   */
  private async handleTerminalResize(_event: IpcMainInvokeEvent, sessionId: string, cols: number, rows: number): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId)
    if (!session) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    try {
      if ('resize' in session && typeof (session as any).resize === 'function') {
        (session as any).resize(cols, rows)
      }
      return true
    } catch (error) {
      logger.error(`调整会话 ${sessionId} 终端大小失败`, error)
      throw error
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    // 清理所有缓冲区
    for (const [sessionId] of this.outputBuffer) {
      this.clearOutputBuffer(sessionId)
    }
    this.outputBuffer.clear()
  }
}
