import type { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm'
import type { TerminalShortcutOptions } from 'terminal'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import { tinykeys } from 'tinykeys'
import { defaultTerminalShortcut } from './shortcut'
import '@xterm/xterm/css/xterm.css'

export interface TerminalEventMap {
  data: (data: string) => void
  resize: (dimensions: { cols: number, rows: number }) => void
  focus: () => void
  blur: () => void
}

export class NxTerminal {
  private __terminal: Terminal | null = null
  private fitAddon: FitAddon = new FitAddon()
  private webglAddon: WebglAddon | null = null
  private shortcuts: TerminalShortcutOptions = {}
  private defaultOptions: ITerminalOptions = {
    fontSize: 14,
    fontFamily: 'JetBrains Mono,monospace',
    cursorStyle: 'underline',
    cursorBlink: true
  }

  private eventListeners: Partial<{ [K in keyof TerminalEventMap]: TerminalEventMap[K][] }> = {}
  private container: HTMLElement | null = null

  constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions, shortcuts?: TerminalShortcutOptions) {
    this.__terminal = new Terminal(Object.assign({}, this.defaultOptions, options))
    this.__terminal.loadAddon(this.fitAddon)

    // 支持快捷键
    this.shortcuts = Object.assign({}, defaultTerminalShortcut, shortcuts)

    // WebGL支持
    try {
      this.webglAddon = new WebglAddon()
      this.webglAddon.onContextLoss(() => {
        if (this.webglAddon) {
          this.webglAddon.dispose()
          this.webglAddon = null
        }
      })
      this.__terminal.loadAddon(this.webglAddon)
    } catch (e) {
      console.warn('WebGL加载失败，降级为Canvas渲染', e)
    }

    // 监听终端数据
    this.__terminal.onData((data) => {
      this.emit('data', data)
    })

    // 监听终端大小变化
    this.__terminal.onResize((size) => {
      this.emit('resize', size)
    })
  }

  openTerminal(target: HTMLElement) {
    if (!this.__terminal)
      return

    this.container = target
    this.__terminal.open(target)
    this.__terminal.focus()
    this.fitAddon.fit()

    // 设置快捷键
    if (target.id) {
      tinykeys(document.getElementById(target.id)!, this.shortcuts)
    } else {
      const parentElement = target.parentElement
      if (parentElement && parentElement.id) {
        tinykeys(document.getElementById(parentElement.id)!, this.shortcuts)
      }
    }

    // 设置鼠标滚轮事件
    this.setupWheelEvents()

    // 添加焦点事件监听
    this.setupFocusEvents(target)

    // 窗口大小变化时自动调整终端大小
    window.addEventListener('resize', this.handleResize)
  }

  private setupFocusEvents(element: HTMLElement) {
    // 使用DOM事件监听焦点变化
    element.addEventListener('focus', () => {
      this.emit('focus')
    })

    element.addEventListener('blur', () => {
      this.emit('blur')
    })

    // 如果element是容器而不是终端本身，则需要处理子元素的事件冒泡
    element.addEventListener('focusin', () => {
      this.emit('focus')
    })

    element.addEventListener('focusout', () => {
      this.emit('blur')
    })
  }

  private handleResize = () => {
    if (this.__terminal) {
      this.fitAddon.fit()
    }
  }

  private setupWheelEvents() {
    if (!this.__terminal || !this.container)
      return

    this.__terminal.attachCustomWheelEventHandler((event: WheelEvent) => {
      const { ctrlKey } = event
      if (ctrlKey) {
        if (event.deltaY < 0) {
          this.zoomIn(event)
        } else {
          this.zoomOut(event)
        }
        return true
      }
      return false
    })
  }

  zoomIn(event?: KeyboardEvent | WheelEvent) {
    if (event)
      event.preventDefault()
    if (!this.__terminal)
      return

    const currentSize = this.__terminal.options.fontSize || this.defaultOptions.fontSize
    this.__terminal.options.fontSize = currentSize! + 1
    this.fitAddon.fit()
  }

  zoomOut(event?: KeyboardEvent | WheelEvent) {
    if (event)
      event.preventDefault()
    if (!this.__terminal)
      return

    const currentSize = this.__terminal.options.fontSize || this.defaultOptions.fontSize
    const minSize = 9
    this.__terminal.options.fontSize = currentSize! > minSize ? currentSize! - 1 : currentSize
    this.fitAddon.fit()
  }

  resetFontSize(event?: KeyboardEvent) {
    if (event)
      event.preventDefault()
    if (!this.__terminal)
      return

    this.__terminal.options.fontSize = this.defaultOptions.fontSize
    this.fitAddon.fit()
  }

  setOptions<K extends keyof ITerminalOptions>(key: K, value: ITerminalOptions[K]) {
    if (this.__terminal) {
      this.__terminal.options[key] = value

      // 如果更改了字体大小，需要重新调整终端大小
      if (key === 'fontSize' || key === 'fontFamily') {
        this.fitAddon.fit()
      }
    }
  }

  write(data: string) {
    if (this.__terminal) {
      this.__terminal.write(data)
    }
  }

  writeln(data: string) {
    if (this.__terminal) {
      this.__terminal.writeln(data)
    }
  }

  clear() {
    if (this.__terminal) {
      this.__terminal.clear()
    }
  }

  focus() {
    if (this.__terminal) {
      this.__terminal.focus()
    }
  }

  blur() {
    if (this.__terminal) {
      this.__terminal.blur()
    }
  }

  on<K extends keyof TerminalEventMap>(event: K, listener: TerminalEventMap[K]) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event]!.push(listener as any)
    return this
  }

  off<K extends keyof TerminalEventMap>(event: K, listener: TerminalEventMap[K]) {
    if (!this.eventListeners[event])
      return this

    const idx = this.eventListeners[event]!.indexOf(listener as any)
    if (idx !== -1) {
      this.eventListeners[event]!.splice(idx, 1)
    }
    return this
  }

  private emit<K extends keyof TerminalEventMap>(event: K, ...args: Parameters<TerminalEventMap[K]>) {
    if (!this.eventListeners[event])
      return

    for (const listener of this.eventListeners[event]!) {
      (listener as any)(...args)
    }
  }

  dispose() {
    if (this.__terminal) {
      this.__terminal.dispose()
      this.__terminal = null
    }

    this.fitAddon.dispose()

    if (this.webglAddon) {
      this.webglAddon.dispose()
      this.webglAddon = null
    }

    window.removeEventListener('resize', this.handleResize)

    // 移除容器上的事件监听器
    if (this.container) {
      this.container.removeEventListener('focus', () => this.emit('focus'))
      this.container.removeEventListener('blur', () => this.emit('blur'))
      this.container.removeEventListener('focusin', () => this.emit('focus'))
      this.container.removeEventListener('focusout', () => this.emit('blur'))
    }

    this.container = null
    this.eventListeners = {}
  }

  get terminal() {
    return this.__terminal
  }
}
