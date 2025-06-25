import type { IPty } from 'node-pty'
import type { ILocalSessionConfig, SessionType } from 'ns-session'
import { BaseSession } from '@/session/base-session'
import { spawn } from 'node-pty'

export class LocalSession extends BaseSession {
  type: SessionType = 'local'
  private pty?: IPty
  private shellPath: string
  private shellArgs: string[]
  private connectTimeout?: NodeJS.Timeout

  constructor(config: ILocalSessionConfig, id?: string) {
    super(id, 'local')
    this.shellPath = config.shellPath
    this.shellArgs = config.args || []
  }

  async connect(): Promise<void> {
    try {
      // 清理之前的连接
      if (this.pty) {
        await this.disconnect()
      }

      // 设置连接超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        this.connectTimeout = setTimeout(() => {
          reject(new Error(`连接超时: ${this.shellPath}`))
        }, 10000) // 10秒超时
      })

      const connectPromise = new Promise<void>((resolve, reject) => {
        try {
          this.pty = spawn(this.shellPath, this.shellArgs, {
            name: 'xterm-color',
            cwd: process.env.HOME || process.cwd(),
            env: process.env,
            cols: 100,
            rows: 40,
            useConpty: false
          })

          this.pty.onData((data) => {
            this.handleOutput(data)
          })

          this.pty.onExit((e) => {
            console.info(`[LocalSession ${this.id}] 进程退出`, e)
            this.setConnected(false)
            if (this.onData) {
              this.onData(`\r\n进程已退出 (代码: ${e.exitCode})\r\n`)
            }
          })

          // 连接成功
          this.setConnected(true)
          resolve()
        } catch (error) {
          reject(error)
        }
      })

      await Promise.race([connectPromise, timeoutPromise])

      // 清理超时定时器
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout)
        this.connectTimeout = undefined
      }
    } catch (error) {
      // 清理超时定时器
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout)
        this.connectTimeout = undefined
      }

      this.handleError(error as Error, '连接失败')
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout)
        this.connectTimeout = undefined
      }

      if (this.pty) {
        // 优雅关闭
        this.pty.kill('SIGTERM')

        // 等待一段时间后强制杀死
        setTimeout(() => {
          if (this.pty) {
            this.pty.kill('SIGKILL')
          }
        }, 3000)

        this.pty = undefined
      }

      this.setConnected(false)
    } catch (error) {
      this.handleError(error as Error, '断开连接失败')
      throw error
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.pty || !this.isConnected) {
      throw new Error('会话未连接')
    }

    try {
      this.pty.write(`${command}\r`)
    } catch (error) {
      this.handleError(error as Error, '发送命令失败')
      throw error
    }
  }

  async handleInput(data: string): Promise<void> {
    if (!this.pty || !this.isConnected) {
      console.warn(`[LocalSession ${this.id}] 无法处理输入，pty未初始化:`, data)
      return
    }

    try {
      if (data === '\r') {
        this.pty.write('\r')
      } else {
        this.pty.write(data)
      }
    } catch (error) {
      this.handleError(error as Error, '处理输入失败')
    }
  }

  resize(cols: number, rows: number): void {
    if (this.pty && this.isConnected) {
      try {
        this.pty.resize(cols, rows)
      } catch (error) {
        this.handleError(error as Error, '调整终端大小失败')
      }
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
