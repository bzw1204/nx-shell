import { Octokit } from "@octokit/rest"


interface OctokitCacheType {
  instance: Octokit
  expiration: number
}

class NxGist {
  // 使用 Map 缓存实例，增加过期时间属性
  private readonly cache = new Map<string, OctokitCacheType>()

  // 过期时间设置为 30min
  private readonly expirationTime = 30 * 60 * 1000

  // 获取 Octokit 实例
  getInstance(token: string): Octokit {
    const currentTime = Date.now()

    // 从缓存中查找实例
    if (this.cache.has(token)) {
      const cacheValue = this.cache.get(token)!
      // 判断实例是否过期
      if (currentTime - cacheValue.expiration <= this.expirationTime) {
        return cacheValue.instance
      }
      // 清理过期实例
      this.cache.delete(token)
    }

    // 缓存不存在或实例已过期，新建实例
    const instance = new Octokit({
      auth: token
    })

    // 添加到缓存
    const expiration = currentTime
    this.cache.set(token, { instance, expiration })
    return instance
  }

  // 清空缓存
  clearCache(): void {
    this.cache.clear()
  }
}

// 在外部创建全局变量或对象，将实例缓存到外部
const nxGist = new NxGist()

export async function getGist(token: string, gistId: string): Promise<any> {
  const octokit = nxGist.getInstance(token)
  const { data } = await octokit.gists.get({ gist_id: gistId })
  return data
}

export async function updateGist(token: string, gistId: string, files: any): Promise<any> {
  const octokit = nxGist.getInstance(token)
  debugger
  const { data } = await octokit.gists.update({ gist_id: gistId, files })
  return data
}

export async function createGist(token: string, options: any): Promise<any> {
  const octokit = nxGist.getInstance(token)
  const { data } = await octokit.gists.create(options)
  return data
}