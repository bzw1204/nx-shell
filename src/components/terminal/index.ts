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
    cursorBlink: true,
    disableStdin: false,
    allowTransparency: true,
    // 确保终端可接收输入
    convertEol: true,
    // 启用Unicode输入处理
    windowsMode: process.platform === 'win32'
  }

  private eventListeners: Partial<{ [K in keyof TerminalEventMap]: TerminalEventMap[K][] }> = {}
  private container: HTMLElement | null = null
  private isFocused: boolean = false
  private textareaAdded: boolean = false

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
    if (this.__terminal) {
      this.__terminal.onData((data) => {
        this.emit('data', data)
      })

      // 监听终端大小变化
      this.__terminal.onResize((size) => {
        this.emit('resize', size)
      })

      // 监听终端焦点变化
      this.__terminal.element?.addEventListener('focus', () => {
        this.isFocused = true

        this.emit('focus')
      })

      this.__terminal.element?.addEventListener('blur', () => {
        this.isFocused = false

        this.emit('blur')
      })

      // 同时监听数据反馈事件
      this.__terminal.onRender((_e) => {
        if (this.__terminal?.buffer.active.cursorX !== undefined) {
          //
        }
      })
    }
  }

  openTerminal(target: HTMLElement) {
    if (!this.__terminal)
      return

    this.container = target
    this.__terminal.open(target)
    this.__terminal.focus()
    this.fitAddon.fit()

    // 确保终端可以接收输入
    if (this.__terminal.options.disableStdin) {
      this.__terminal.options.disableStdin = false
    }

    // 确保textarea存在并可访问
    this.ensureTextareaExists(target)

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

    // 立即计算并调整终端尺寸
    setTimeout(() => {
      this.fitAddon.fit()
    }, 100)
  }

  // 确保textarea元素存在并可访问
  private ensureTextareaExists(element: HTMLElement) {
    if (this.textareaAdded || !this.__terminal)
      return

    // 查找textarea
    let textarea = element.querySelector('textarea') as HTMLTextAreaElement

    if (!textarea) {
      // 如果没有找到，创建一个新的
      textarea = document.createElement('textarea')
      textarea.classList.add('xterm-helper-textarea')
      textarea.setAttribute('aria-label', 'Terminal input')
      textarea.setAttribute('autocorrect', 'off')
      textarea.setAttribute('autocapitalize', 'off')
      textarea.setAttribute('spellcheck', 'false')

      // 应用样式使其可见并可触达
      textarea.style.position = 'absolute'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.width = '100%'
      textarea.style.height = '100%'
      textarea.style.opacity = '0'
      textarea.style.background = 'transparent'
      textarea.style.border = 'none'
      textarea.style.padding = '0'
      textarea.style.margin = '0'
      textarea.style.overflow = 'hidden'
      textarea.style.resize = 'none'
      textarea.style.zIndex = '1000'
      textarea.style.pointerEvents = 'none'

      element.appendChild(textarea)

      // 绑定输入事件
      textarea.addEventListener('input', (_ev) => {
        if (this.__terminal && textarea.value) {
          this.__terminal.write(textarea.value)
          textarea.value = ''
        }
      })

      // 绑定键盘事件
      textarea.addEventListener('keydown', (e) => {
        // 阻止默认行为
        if (
          // 允许组合键 (Ctrl/Alt/Meta)
          e.altKey || e.ctrlKey || e.metaKey
          // 允许导航键
          || e.key === 'ArrowUp' || e.key === 'ArrowDown'
          || e.key === 'ArrowLeft' || e.key === 'ArrowRight'
          || e.key === 'Home' || e.key === 'End'
          // 允许编辑键
          || e.key === 'Enter' || e.key === 'Tab'
          || e.key === 'Backspace' || e.key === 'Delete'
          || e.key === 'Escape'
        ) {
          e.preventDefault()

          // 确保terminal对象存在
          if (!this.__terminal)
            return

          // 处理特殊键并发送相应控制序列
          switch (e.key) {
            case 'Enter':
              // 按下回车键时，确保正确发送到后端

              // 删除本地回显，避免重复输入
              // this.__terminal.write('\r\n')  // 注释掉本地回显

              // 确保回车事件能够被正确捕获和处理
              this.emit('data', '\r') // 向后端只发送\r信号
              break
            case 'Backspace':
              // 退格键不需要在前端模拟删除效果，只发送信号给后端
              // 前端不显示删除效果，由后端控制删除并返回正确的显示内容
              // 注释掉这段代码，不在前端直接修改显示内容
              /*
              if (process.platform === 'win32') {
                // Windows 环境
                this.__terminal.write('\b \b')  // 退格+空格+退格组合
              } else {
                // 其他环境，先尝试 DEL 字符
                this.__terminal.write('\x7F')
              }
              */

              // 只发送删除信号给后端，不在前端修改显示内容
              this.emit('data', '\x7F')
              break
            case 'Delete':
              // 使用ANSI删除序列
              this.__terminal.write('\x1B[3~')
              this.emit('data', '\x1B[3~')
              break
            case 'ArrowUp':
              this.__terminal.write('\x1B[A')
              this.emit('data', '\x1B[A')
              break
            case 'ArrowDown':
              this.__terminal.write('\x1B[B')
              this.emit('data', '\x1B[B')
              break
            case 'ArrowRight':
              this.__terminal.write('\x1B[C')
              this.emit('data', '\x1B[C')
              break
            case 'ArrowLeft':
              this.__terminal.write('\x1B[D')
              this.emit('data', '\x1B[D')
              break
            case 'Home':
              this.__terminal.write('\x1B[H')
              this.emit('data', '\x1B[H')
              break
            case 'End':
              this.__terminal.write('\x1B[F')
              this.emit('data', '\x1B[F')
              break
            case 'Tab':
              this.__terminal.write('\t')
              this.emit('data', '\t')
              break
            case 'Escape':
              this.__terminal.write('\x1B')
              this.emit('data', '\x1B')
              break
            default:
              // 自动处理控制键
              if (e.ctrlKey && e.key.length === 1) {
                const code = e.key.toUpperCase().charCodeAt(0) - 64
                if (code > 0 && code < 27) {
                  const ctrlChar = String.fromCharCode(code)
                  this.__terminal.write(ctrlChar)
                  this.emit('data', ctrlChar)
                }
              }
              break
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          // 处理普通字符输入
          e.preventDefault()
          if (this.__terminal) {
            // 删除本地回显，避免重复输入
            // this.__terminal.write(e.key)  // 注释掉本地回显
            this.emit('data', e.key)
          }
        }
      })

      this.textareaAdded = true
    }

    // 确保点击时聚焦到textarea
    element.addEventListener('click', () => {
      if (textarea) {
        textarea.focus()
      }
    })
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

    // 添加点击事件自动聚焦
    element.addEventListener('click', () => {
      if (this.__terminal) {
        this.__terminal.focus()
      }
    })

    // 添加鼠标进入事件自动聚焦（可选）
    element.addEventListener('mouseenter', () => {
      if (this.__terminal && !this.isFocused) {
        this.__terminal.focus()
      }
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
