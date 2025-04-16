import type { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

export class NxTerminal {
  private __terminal: Terminal | null = null
  private fitAddon: FitAddon = new FitAddon()
  private webglAddon: WebglAddon = new WebglAddon()
  private defaultOptions: ITerminalOptions = {
    fontSize: 14,
    fontFamily: 'JetBrains Mono,monospace',
    cursorStyle: 'underline',
    cursorBlink: true
  }

  constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions) {
    this.__terminal = new Terminal(Object.assign({}, this.defaultOptions, options))
    this.__terminal.loadAddon(this.fitAddon)
    this.webglAddon.onContextLoss(() => {
      this.webglAddon.dispose()
    })
    this.__terminal.loadAddon(this.webglAddon)
  }

  openTerminal(target: HTMLElement) {
    if (this.__terminal) {
      this.__terminal.open(target)
      this.__terminal.focus()
      this.fitAddon.activate(this.__terminal)
      this.fitAddon.fit()
    }
  }

  setOptions<K extends keyof ITerminalOptions>(key: K, value: ITerminalOptions[K]) {
    if (this.__terminal) {
      this.__terminal.options[key] = value
    }
  }

  dispose() {
    if (this.__terminal) {
      this.__terminal.dispose()
      this.__terminal = null
    }
    this.fitAddon.dispose()
  }
}
