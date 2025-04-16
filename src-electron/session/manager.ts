import type { BaseSession } from './interface'

import { LocalSession } from './LocalSession'

export class SessionManager {
  private sessions: Map<string, any> = new Map<string, any>()

  createSession(): void {
    const localSession = new LocalSession()
    this.sessions.set(localSession.getId(), localSession)
  }

  getSession(id: string): BaseSession | undefined {
    return this.sessions.get(id)
  }
}
