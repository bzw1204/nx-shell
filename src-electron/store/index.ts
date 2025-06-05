import type { ISettings } from 'nx-settings'
import { ipcMain } from 'electron'
import Store from 'electron-store'

const settings = new Store<ISettings>({
  name: 'settings',
  watch: true,
  defaults: {
    theme: 'light'
  },
  migrations: {

  }
})
export function initStoreIpc() {
  ipcMain.handle('store:get', (_, key, defaultValue) => {
    return settings.get(key, defaultValue)
  })
  ipcMain.handle('store:set', (_, key, value) => {
    return settings.set(key, value)
  })
  ipcMain.handle('store:delete', (_, key) => {
    return settings.delete(key)
  })
  ipcMain.handle('store:has', (_, key) => {
    return settings.has(key)
  })
  ipcMain.handle('store:size', () => {
    return settings.size
  })
  ipcMain.handle('store:reset', (_, key, value) => {
    return settings.reset(key, value)
  })
  ipcMain.handle('store:clear', () => {
    return settings.clear()
  })
}
export default settings
