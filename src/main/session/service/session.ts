export type SESSION_TYPE = 'ssh' | 'ftp' | 'sftp' | 'telnet' | 'webdav' | 'vnc' | 'serial' | 'shell'
export type PROTOCOL_TYPE = SESSION_TYPE
export const sessionTypes: Record<SESSION_TYPE, SESSION_TYPE> = {
  ssh: 'ssh',
  ftp: 'ftp',
  sftp: 'sftp',
  telnet: 'telnet',
  webdav: 'webdav',
  vnc: 'vnc',
  serial: 'serial',
  shell: 'shell'
}
export interface ISessionOptions {
  name: string
  protocol: PROTOCOL_TYPE
  host: string
  username: string
  password: string
}
export class ISession {
  private id: string
  name: string
  type: SESSION_TYPE
  constructor(name: string, type: SESSION_TYPE) {
    this.id = crypto.randomUUID()
    this.name = name
    this.type = type
  }

  /**
   * 获取会话ID
   * @returns 会话ID
   */
  getSessionId(): string {
    return this.id
  }

  connect() {}

  duplicate() {}

  disconnect() {}

  /**
   * 销毁会话
   * 因为会话很有可能会在duplicate时，被复制的会话引用
   * 所以当所有引用被解除时才是销毁会话的时机
   */
  dispose() {}
}
