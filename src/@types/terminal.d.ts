declare module 'terminal' {
  interface TerminalShortcut {
    key: string
    handler: (...args: any[]) => void
  }
  interface TerminalShortcutOptions {
    [key: string]: (...args: any[]) => void
  }
}
