import type { ISession, SessionType } from 'ns-session'
import { Terminal } from '@xterm/xterm'
import { ipcMain } from 'electron/main'
import { nanoid } from 'nanoid'

export class BaseSession implements ISession {
  id: string
  type: SessionType
  terminal: Terminal

  constructor(id: string = nanoid(), type: SessionType) {
    this.id = id
    this.type = type
    this.terminal = new Terminal()
  }

  async initializeTerminal(): Promise<void> {
    this.terminal.options.cursorBlink = true
    this.terminal.open(document.getElementById('terminal-container')!)
  }

  async handleOutput(data: string): Promise<void> {
    this.terminal.write(data)
  }

  async handleInput(_data: string): Promise<void> {

  }

  async listenToTerminalEvents(): Promise<void> {
    this.terminal.onData((data) => {
      this.handleInput(data)
    })
  }

  async destroyTerminal(): Promise<void> {
    this.terminal.dispose()
  }

  async connect(): Promise<void> {
    this.terminal.focus()
    this.terminal.writeln('Welcome to NxShell')
  }

  async disconnect(): Promise<void> {
    this.terminal.dispose()
  }

  async sendCommand(command: string): Promise<void> {
    ipcMain.emit('send-command', this.id, command)
  }

  clone(): ISession {
    return new BaseSession(undefined, this.type)
  }
}
