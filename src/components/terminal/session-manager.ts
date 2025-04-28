import type { LocalTerminalOptions, SshTerminalOptions, TerminalSession } from 'terminal'
import { EventEmitter } from 'node:events'

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
  createLocalSession(_options: LocalTerminalOptions): TerminalSession {
    // 实际实现会在electron端处理，这里只是接口定义
    // 需要与Electron IPC通信创建真实会话
    throw new Error('需要由具体实现类实现该方法')
  }

  /**
   * 创建SSH会话
   */
  createSshSession(_options: SshTerminalOptions): TerminalSession {
    // 实际实现会在electron端处理，这里只是接口定义
    throw new Error('需要由具体实现类实现该方法')
  }

  /**
   * 清理所有会话
   */
  dispose(): void {
    for (const session of this.sessions.values()) {
      if (session.isConnected) {
        session.disconnect()
      }
      session.dispose()
    }

    this.sessions.clear()
    this.activeSessionId = null
    this.removeAllListeners()
  }
}
