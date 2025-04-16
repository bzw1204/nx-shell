import type { SESSION_TYPE } from 'nx-shell-session'
import { nanoid } from 'nanoid'
// 定义一个抽象类 BaseSession
export abstract class BaseSession {
  // 受保护的 id 属性，默认为空字符串
  protected id: string = ''
  // 受保护的 type 属性，默认为 'local'
  protected type: SESSION_TYPE = 'local'

  // 构造函数
  constructor() {
    // 初始化逻辑可以在这里添加
    this.id = nanoid(7)
  }

  getId(): string {
    return this.id
  }
  // 抽象方法 connect，返回 Promise<void>
  abstract connect(): Promise<void>

  // 抽象方法 disconnect，返回 Promise<void>
  abstract disconnect(): Promise<void>

  // 抽象方法 duplicate，返回 Promise<void>
  abstract duplicate(): Promise<void>

  // 抽象方法 rename，返回 Promise<void>
  abstract rename(): Promise<void>

  // 抽象方法 remove，返回 Promise<void>
  abstract remove(): Promise<void>

  // 添加新的抽象方法 mainCourse，返回 Promise<void>
  abstract mainCourse(): Promise<void>
}
