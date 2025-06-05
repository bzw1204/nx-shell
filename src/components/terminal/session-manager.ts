import type { LocalTerminalOptions, SshTerminalOptions, TerminalSession } from 'terminal'
import { ElectronTerminalAdapter, ElectronTerminalSession } from './electron-terminal-adapter'

// 定义事件处理器函数类型
type EventHandler = (...args: any[]) => void

// 创建一个浏览器兼容的 EventEmitter 实现
class EventEmitter {
  private events: Record<string, EventHandler[]> = {}

  on(event: string, listener: EventHandler): this {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
    return this
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events[event]
    if (!listeners || listeners.length === 0) {
      return false
    }

    listeners.forEach((listener) => {
      listener(...args)
    })
    return true
  }

  removeListener(event: string, listener: EventHandler): this {
    if (!this.events[event]) {
      return this
    }

    this.events[event] = this.events[event].filter(l => l !== listener)
    return this
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
    return this
  }
}

export class TerminalSessionManager extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map()
  private activeSessionId: string | null = null

  /**
   * 添加新会话
   */
  addSession(session: TerminalSession): TerminalSession {
    this.sessions.set(session.id, session)

    if (this.activeSessionId === null) {
      this.activeSessionId = session.id
      this.emit('session-activated', session)
    }

    this.emit('session-added', session)
    return session
  }

  /**
   * 移除会话
   */
  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session)
      return false

    // 断开连接
    if (session.isConnected) {
      session.disconnect()
    }

    // 释放资源
    session.dispose()

    // 从映射中删除
    this.sessions.delete(sessionId)

    // 如果删除的是当前活动会话，则切换到其他会话
    if (this.activeSessionId === sessionId) {
      const nextSession = this.sessions.values().next().value
      if (nextSession) {
        this.activeSessionId = nextSession.id
        this.emit('session-activated', nextSession)
      } else {
        this.activeSessionId = null
        this.emit('session-activated', null)
      }
    }

    this.emit('session-removed', sessionId)
    return true
  }

  /**
   * 激活指定会话
   */
  activateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session)
      return false

    this.activeSessionId = sessionId
    this.emit('session-activated', session)
    return true
  }

  /**
   * 获取活动会话
   */
  getActiveSession(): TerminalSession | null {
    if (!this.activeSessionId)
      return null
    return this.sessions.get(this.activeSessionId) || null
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }

  /**
   * 获取指定会话
   */
  getSession(sessionId: string): TerminalSession | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * 向所有会话广播命令
   */
  broadcastCommand(command: string): void {
    for (const session of this.sessions.values()) {
      if (session.isConnected) {
        session.write(command)
      }
    }
    this.emit('command-broadcasted', command)
  }

  /**
   * 创建本地会话
   */
  async createLocalSession(options: LocalTerminalOptions): Promise<TerminalSession> {
    try {
      // 使用适配器创建本地会话
      const session = await ElectronTerminalAdapter.createLocalSession(options)

      // 添加到会话列表
      this.addSession(session)

      // 连接到会话
      await session.connect()

      return session
    } catch (error) {
      console.error('创建本地会话失败:', error)
      throw error
    }
  }

  /**
   * 创建SSH会话
   */
  async createSshSession(options: SshTerminalOptions): Promise<TerminalSession> {
    try {
      // 使用适配器创建SSH会话
      const session = await ElectronTerminalAdapter.createSshSession(options)

      // 添加到会话列表
      this.addSession(session)

      // 连接到会话
      await session.connect()

      return session
    } catch (error) {
      console.error('创建SSH会话失败:', error)
      throw error
    }
  }

  /**
   * 初始化会话管理器，加载可能的现有会话
   */
  async initialize(): Promise<void> {
    try {
      // 获取来自后端的会话列表
      const sessions = await ElectronTerminalAdapter.listSessions()

      // 重建会话对象并添加到管理器
      for (const { id, type } of sessions) {
        const termType = type as 'local' | 'ssh' | 'telnet' | 'serial'
        const session = new ElectronTerminalSession(id, termType)
        this.addSession(session)
      }
    } catch (error) {
      console.error('初始化会话管理器失败:', error)
    }
  }

  /**
   * 清理所有会话
   */
  dispose(): void {
    for (const session of this.sessions.values()) {
      if (session.isConnected) {
        session.disconnect()
        this.emit('session-removed', session.id)
      }
      session.dispose()
    }

    this.sessions.clear()
    this.activeSessionId = null
    this.removeAllListeners()
  }
}
