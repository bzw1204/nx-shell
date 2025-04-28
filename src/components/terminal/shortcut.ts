import type { TerminalShortcutOptions } from 'terminal'

export const defaultTerminalShortcut: TerminalShortcutOptions = {
  // 缩放控制
  'Alt+=': event => event.preventDefault(),
  'Alt+-': event => event.preventDefault(),
  'Alt+0': event => event.preventDefault(),

  // 复制粘贴
  'Ctrl+Shift+c': event => event.preventDefault(),
  'Ctrl+Shift+v': event => event.preventDefault(),

  // 终端清屏
  'Ctrl+l': event => event.preventDefault(),

  // 终端搜索
  'Ctrl+f': event => event.preventDefault()
}
