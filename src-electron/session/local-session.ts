import type { IPty } from 'node-pty'
import type { ILocalSessionConfig, SessionType } from 'ns-session'
import { BaseSession } from '@/session/base-session'
import { spawn } from 'node-pty'

export class LocalSession extends BaseSession {
  type: SessionType = 'local'
  private pty?: IPty
  private shellPath: string
  private shellArgs: string[]

  constructor(config: ILocalSessionConfig, id?: string) {
    super(id, 'local')
    this.shellPath = config.shellPath
    this.shellArgs = config.args || []
  }

  async connect(): Promise<void> {
    this.pty = spawn(this.shellPath, this.shellArgs, {
      name: 'xterm-color',
      cwd: process.env.HOME || process.cwd(),
      env: process.env,
      cols: 100,
      rows: 40
    })

    this.pty.onData((data) => {
      this.handleOutput(data)
    })

    this.pty.onExit((e) => {
      console.info(`[LocalSession ${this.id}] exited`, e)
    })
  }

  async disconnect(): Promise<void> {
    this.pty?.kill()
  }

  async sendCommand(command: string): Promise<void> {
    if (this.pty) {
      this.pty.write(`${command}\r`)
    }
  }

  async handleInput(data: string): Promise<void> {
    if (!this.pty) {
      console.warn(`[LocalSession ${this.id}] 无法处理输入，pty未初始化:`, data)
      return
    }

    const hexData = Array.from(data).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
    console.log(`[LocalSession ${this.id}] 处理输入: "${data}" (hex: ${hexData})`)

    if (data === '\r') {
      console.log(`[LocalSession ${this.id}] 处理回车键`)
      this.pty.write('\r')
    } else {
      this.pty.write(data)
    }
  }

  resize(cols: number, rows: number): void {
    if (this.pty) {
      this.pty.resize(cols, rows)
    }
  }

  clone(): LocalSession {
    return new LocalSession(
      {
        shellPath: this.shellPath,
        args: this.shellArgs,
        type: this.type
      },
      undefined
    )
  }
}
