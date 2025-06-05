import type { ISettings } from '@nxshell/renderer/store'

export default defineStore('settings', {
  state: (): ISettings => ({
    theme: 'dark'
  })
})
