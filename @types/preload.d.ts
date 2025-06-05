declare module 'preload' {
  import type { ISettings } from 'nx-settings'

  interface IRendererStore {
    get: <K extends keyof ISettings>(key: K, defaultValue: Required<ISettings>[K],) => Promise<Required<ISettings>[K]>
    set: <K extends keyof ISettings>(key: K, value: ISettings[K],) => Promise<boolean>
    has: <K extends keyof ISettings>(key: K) => Promise<boolean>
    delete: <K extends keyof ISettings>(key: K) => Promise<boolean>
    reset: <K extends keyof ISettings>(key: K, value?: ISettings[K],) => Promise<boolean>
    clear: () => Promise<boolean>
  }
  interface IApi {
    platform: {
      isMacOS: boolean
    }
  }
}
