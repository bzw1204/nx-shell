import { SshSession } from './service/impl/sshSession'
import { ISession, ISessionOptions, SESSION_TYPE } from './service/session'

export class SessionManager {
  sessions: Map<string, ISession>
  active: number
  constructor() {
    this.sessions = new Map<string, ISession>()
    this.active = 0
  }
  createSession(type: SESSION_TYPE, options: ISessionOptions) {
    let session: ISession | null = null
    switch (type) {
      case 'ssh':
        session = new SshSession(options)
        break
      case 'telnet':
      case 'vnc':
      case 'ftp':
      case 'sftp':
      case 'webdav':
      case 'serial':
      case 'shell':
      default:
    }
    session && this.sessions.set(session.getSessionId(), session)
  }

  getSession(id: string) {
    return this.sessions.get(id)
  }

  remove(id: string) {
    try {
      // 获取会话实例
      const instance = this.sessions.get(id)
      // 销毁实例
      instance?.dispose()
      // 从会话列表中移除
      this.sessions.delete(id)
    } catch (error) {
      console.error('session dispose fail', error)
    }
  }

  clearAll() {
    const keys = [...this.sessions.keys()]
    keys.forEach((x) => this.remove(x))
  }
}
