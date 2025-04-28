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

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client
        .on('ready', () => {
          console.info(`SshSession(${this.id}) - 连接成功`)
          // 建立 SFTP 会话
          this.client.sftp((err, sftp) => {
            if (err) {
              return reject(err)
            }
            this.sftp = sftp
            resolve()
          })
        })
        .on('error', (err) => {
          console.error(`SshSession(${this.id}) - 连接出错`, err)
          reject(err)
        })
        .connect(this.config)
    })
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.client.end()
      resolve()
    })
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

  // 如果支持复制，此处实现 clone 方法
  clone(): SshSession {
    return new SshSession(this.config)
  }
}
