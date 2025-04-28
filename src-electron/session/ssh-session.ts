import type { Buffer } from 'node:buffer'
import type { ISessionConfig } from 'ns-session'
import type { SFTPWrapper } from 'ssh2'
import { Client } from 'ssh2'
import { BaseSession } from './base-session'

export class SshSession extends BaseSession {
  private config: ISessionConfig
  private client: Client
  private sftp?: SFTPWrapper

  constructor(config: ISessionConfig, id?: string) {
    super(id, 'ssh')
    this.config = config
    this.client = new Client()
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.client.shell((err, stream) => {
          if (err)
            return reject(err)

          stream.on('data', (data: Buffer) => {
            this.handleOutput(data.toString())
          })

          stream.on('close', () => {
            this.disconnect()
          })

          resolve()
        })
      }).on('error', (err) => {
        reject(err)
      }).connect({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        privateKey: this.config.privateKey
      })
    })
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.client.end()
      resolve()
    })
  }

  resize(cols: number, rows: number): void {
    if (this.client && this.client.exec) {
      // 使用SSH扩展指令调整终端大小
      // 这里需要根据实际SSH库的实现进行调整
      this.client.exec(`stty cols ${cols} rows ${rows}`, (err, stream) => {
        if (err)
          console.error('Failed to resize SSH terminal', err)
        stream.on('close', () => {
          // 大小调整完成
        })
      })
    }
  }

  sendCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 例如这里可调用 exec 方法执行远程命令
      this.client.exec(command, (err, channel) => {
        if (err)
          return reject(err)
        channel.on('close', () => {
          resolve()
        }).on('data', (data: Buffer) => {
          console.info(`SshSession(${this.id}) 输出: ${data.toString()}`)
        }).stderr.on('data', (data: Buffer) => {
          console.error(`SshSession(${this.id}) 错误: ${data.toString()}`)
        })
      })
    })
  }

  listDir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sftp?.readdir(path, (err, files) => {
        if (err) {
          return reject(err)
        }
        resolve(files?.map(file => file.filename) || [])
      })
    })
  }

  clone(): SshSession {
    return new SshSession(this.config, undefined)
  }
}
