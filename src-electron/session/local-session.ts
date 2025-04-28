import type { IPty } from 'node-pty'
import type { ILocalSessionConfig, SessionType } from 'ns-session'
import { BaseSession } from '@/session/base-session'
import { spawn } from 'node-pty'

export class LocalSession extends BaseSession {
  type: SessionType = 'local'
  private pty?: IPty
  private shellPath: string
  private shellArgs: string[]

  onData?: (data: string) => void

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
      if (this.onData) {
        this.onData(data)
      }
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
