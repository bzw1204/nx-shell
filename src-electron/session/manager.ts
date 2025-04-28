import type { ISession } from 'ns-session'
import { EventEmitter } from 'node:events'

export class SessionManager extends EventEmitter {
  private sessions: Map<string, ISession> = new Map()
  private activeSessionId: string | null = null

  addSession(session: ISession) {
    this.sessions.set(session.id, session)
    if (!this.activeSessionId) {
      this.activeSessionId = session.id
      this.emit('sessionSwitched', session)
    }
    this.emit('sessionAdded', session)
  }

  removeSession(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.disconnect()
      this.sessions.delete(sessionId)
      this.emit('sessionRemoved', session)
      if (this.activeSessionId === sessionId) {
        const next = this.sessions.values().next().value || null
        this.activeSessionId = next?.id || null
        this.emit('sessionSwitched', next)
      }
    }
  }

  switchSession(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.activeSessionId = sessionId
      this.emit('sessionSwitched', session)
    }
  }

  broadcast(command: string) {
    for (const session of this.sessions.values()) {
      session.sendCommand(command)
    }
    this.emit('commandBroadcast', command)
  }

  cloneSession(sessionId: string): ISession | null {
    const original = this.sessions.get(sessionId)
    if (original?.clone) {
      const newSession = original.clone()
      this.addSession(newSession)
      return newSession
    }
    return null
  }

  getActive(): ISession | null {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null
  }

  getAll(): ISession[] {
    return Array.from(this.sessions.values())
  }
}
