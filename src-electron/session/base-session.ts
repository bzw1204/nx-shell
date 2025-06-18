import type { ISession, SessionType } from 'ns-session'
import { nanoid } from 'nanoid'

export class BaseSession implements ISession {
  id: string
  type: SessionType
  onData?: (data: string) => void

  // 移除terminal属性，这应该在渲染进程中处理
  private _isConnected: boolean = false

  constructor(id: string = nanoid(), type: SessionType) {
    this.id = id
    this.type = type
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  protected setConnected(connected: boolean): void {
    this._isConnected = connected
  }

  // 移除DOM相关方法，这些应该在渲染进程中处理
  async handleOutput(data: string): Promise<void> {
    if (this.onData) {
      this.onData(data)
    }
  }

  async handleInput(data: string): Promise<void> {
    // 基础会话的handleInput方法，将在子类中被覆盖
    console.warn(`[BaseSession ${this.id}] 基础handleInput方法被调用，但这应该在子类中实现。数据:`, data)
  }

  async connect(): Promise<void> {
    this.setConnected(true)
    console.log(`[BaseSession ${this.id}] 连接成功`)
  }

  async disconnect(): Promise<void> {
    this.setConnected(false)
    console.log(`[BaseSession ${this.id}] 断开连接`)
  }

  async sendCommand(command: string): Promise<void> {
    console.warn(`[BaseSession ${this.id}] 基础sendCommand方法被调用，但这应该在子类中实现。命令:`, command)
  }

  clone(): ISession {
    return new BaseSession(undefined, this.type)
  }

  // 添加错误处理方法
  protected handleError(error: Error, context: string): void {
    console.error(`[BaseSession ${this.id}] ${context}:`, error)
    if (this.onData) {
      this.onData(`\r\n错误: ${error.message}\r\n`)
    }
  }
}
