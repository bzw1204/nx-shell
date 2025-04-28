declare module 'terminal' {
  interface TerminalShortcut {
    key: string
    handler: (...args: any[]) => void
  }
  interface TerminalShortcutOptions {
    [key: string]: (...args: any[]) => void
  }

  type TerminalSessionType = 'local' | 'ssh' | 'telnet' | 'serial'

  interface TerminalSessionOptions {
    id?: string
    name?: string
    type: TerminalSessionType
    cwd?: string
    env?: Record<string, string>
    encoding?: string
    cols?: number
    rows?: number
  }

  interface TerminalSession {
    id: string
    type: TerminalSessionType
    name: string
    isConnected: boolean

    connect: () => Promise<void>
    disconnect: () => Promise<void>

    write: (data: string) => void
    resize: (cols: number, rows: number) => void

    onData: (callback: (data: string) => void) => void
    onExit: (callback: (code: number, signal?: string) => void) => void

    dispose: () => void
  }

  interface LocalTerminalOptions extends TerminalSessionOptions {
    shell?: string
    args?: string[]
  }

  interface SshTerminalOptions extends TerminalSessionOptions {
    host: string
    port?: number
    username: string
    password?: string
    privateKey?: string
    passphrase?: string
  }
}
