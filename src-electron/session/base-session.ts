import type { ISession, SessionType } from 'ns-session'
import { Terminal } from '@xterm/xterm'
import { ipcMain } from 'electron/main'
import { nanoid } from 'nanoid'

export class BaseSession implements ISession {
  id: string
  type: SessionType
  terminal: Terminal
  onData?: (data: string) => void

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
    if (this.onData) {
      this.onData(data)
    }
  }

  async handleInput(data: string): Promise<void> {
    // 基础会话的handleInput方法，将在子类中被覆盖
    console.warn(`[BaseSession ${this.id}] 基础handleInput方法被调用，但这应该在子类中实现。数据:`, data)
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
