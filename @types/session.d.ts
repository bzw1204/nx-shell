declare module 'ns-session' {
  type SessionType = 'ssh' | 'ftp' | 'sftp' | 'telnet' | 'webdav' | 'vnc' | 'serial' | 'local'

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
