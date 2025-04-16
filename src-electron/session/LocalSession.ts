import os from 'node:os'
import * as pty from 'node-pty'
import { BaseSession } from './interface'

// 定义一个具体类 LocalSession，继承自 BaseSession
export class LocalSession extends BaseSession {
  private ptyProcess: pty.IPty | null = null

  constructor() {
    super()
    this.type = 'local' // 设置会话类型为 'local'
  }

  // 实现 connect 方法
  async connect(): Promise<void> {
    try {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
      this.ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
      })

      this.ptyProcess.onData((data) => {
        console.info(data) // 处理终端输出
      })
    } catch (error) {
      console.error('Failed to connect to local session:', error)
      throw new Error('Connection failed')
    }
  }

  // 实现 disconnect 方法
  async disconnect(): Promise<void> {
    try {
      console.info('Disconnecting from local session...')
      if (this.ptyProcess) {
        this.ptyProcess.kill()
        this.ptyProcess = null
      }
    } catch (error) {
      console.error('Failed to disconnect from local session:', error)
      throw new Error('Disconnection failed')
    }
  }

  // 实现 duplicate 方法
  async duplicate(): Promise<void> {
    try {
      console.info('Duplicating local session...')
      // 复制逻辑可以是创建一个新的 LocalSession 实例
      const newSession = new LocalSession()
      await newSession.connect()
    } catch (error) {
      console.error('Failed to duplicate local session:', error)
      throw new Error('Duplication failed')
    }
  }

  // 实现 rename 方法
  async rename(): Promise<void> {
    try {
      console.info('Renaming local session...')
      // 重命名逻辑可以是更改会话的某个属性
      this.id = `session-${Date.now()}`
    } catch (error) {
      console.error('Failed to rename local session:', error)
      throw new Error('Rename failed')
    }
  }

  // 实现 remove 方法
  async remove(): Promise<void> {
    try {
      console.info('Removing local session...')
      await this.disconnect()
      // 其他清理逻辑
    } catch (error) {
      console.error('Failed to remove local session:', error)
      throw new Error('Remove failed')
    }
  }

  // 实现 mainCourse 方法
  async mainCourse(): Promise<void> {
    try {
      console.info('Executing main course for local session...')
      // 主食逻辑可以是执行某个命令
      if (this.ptyProcess) {
        this.ptyProcess.write('ls\r')
      }
    } catch (error) {
      console.error('Failed to execute main course for local session:', error)
      throw new Error('Main course execution failed')
    }
  }
}
