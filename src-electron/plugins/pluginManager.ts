import type { NsPlugin } from 'ns-plugin'

export class PluginManager {
  private plugins: NsPlugin[] = []
  private pluginsFolder = './plugins' // 你可以配置插件存放的目录

  // 扫描指定目录并加载插件
  async loadPlugins(): Promise<void> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    try {
      const files = await fs.readdir(this.pluginsFolder)
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.mjs')) {
          const pluginPath = path.join(process.cwd(), this.pluginsFolder, file)
          try {
            const pluginModule = await import(pluginPath)
            // 这里我们假设插件模块导出一个 default 对象，该对象符合 NxShellPlugin 接口
            const plugin: NsPlugin = pluginModule.default
            // 调用初始化方法，传入全局上下文（例如：这里可以传入 SSHManager 实例等）
            if (plugin.initialize) {
              await plugin.initialize({})
            }
            this.plugins.push(plugin)
            console.info(`Loaded plugin: ${plugin.name}`)
          } catch (err) {
            console.error(`Error loading plugin ${file}:`, err)
          }
        }
      }
    } catch (err) {
      console.error('Error reading plugins folder:', err)
    }
  }

  // 可选：对所有插件发送事件
  emitEvent(event: string, data: any) {
    for (const plugin of this.plugins) {
      if (plugin.onEvent) {
        plugin.onEvent(event, data)
      }
    }
  }

  // 退出前调用插件的 dispose
  async disposePlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.dispose) {
        await plugin.dispose()
      }
    }
  }
}
