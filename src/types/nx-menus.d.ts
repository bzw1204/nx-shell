declare module 'nx-menus' {
  interface MenuItemProps {
    id: string
    label: string
    icon?: string | VNode
    ping: number
    group: string
    host: string
    port: number
    loginMethod: 'password' | 'encryption-key' | 'keyboard'
    password?: string
    encryptionKey?: string
    /** 跳板机 */
    springboardMachine?: any
    proxy?: string
    timeout?: number
    // 心跳时间
    heartbeat?: number
    // 密钥交换算法
    algorithm?: string
    // 初始化执行
    initShell?: {
      path: string
      command: string
    }
  }
  interface MenuProps {
    id: string
    label: string
    icon?: string | VNode
    color: string
    items: MenuItemProps[]
  }
}
