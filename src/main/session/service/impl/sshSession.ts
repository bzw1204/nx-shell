import { ISession, ISessionOptions } from '../session'

export interface SshOptions extends ISessionOptions {
  privateKey?: string
}

export class SshSession extends ISession {
  privateKey?: string
  constructor(options: SshOptions) {
    super(options.name, options.protocol)
    this.privateKey = options.privateKey
  }
}
