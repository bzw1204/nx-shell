<script setup lang="ts">
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { tinykeys } from 'tinykeys'
import '@xterm/xterm/css/xterm.css'

const containerElement = ref<HTMLDivElement>()
const terminal = new Terminal(
  {
    fontSize: 14,
    fontFamily: 'monospace',
    cursorBlink: true,
    cursorStyle: 'underline'
  }
)
const fitAddon = new FitAddon()
terminal.loadAddon(fitAddon)
function zoomIn(event: KeyboardEvent | WheelEvent) {
  event.preventDefault()
  console.debug('event', event)
  terminal.options.fontSize = terminal.options.fontSize! + 1
}
function zoomOut(event: KeyboardEvent | WheelEvent) {
  event.preventDefault()
  const fontSize = terminal.options.fontSize || 12
  terminal.options.fontSize = fontSize > 12 ? fontSize - 1 : fontSize
}
function resetFontSize() {
  terminal.options.fontSize = 12
}
onMounted(() => {
  terminal.open(containerElement.value!)
  terminal.write('Hello from xterm.js')
  terminal.focus()
  fitAddon.fit()
  tinykeys(document.getElementById('terminalBox')!, {
    'Alt+=': event => zoomIn(event),
    'Alt+-': event => zoomOut(event),
    'Alt+0': resetFontSize
  })
  terminal.attachCustomWheelEventHandler((event: WheelEvent) => {
    const { ctrlKey } = event
    // 如果ctrl键被按下，则进行字体大小调整
    if (ctrlKey) {
      if (event.deltaY < 0) {
        zoomIn(event)
      } else {
        zoomOut(event)
      }
      return true
    }
    return false
  })
})
</script>

<template>
  <div id="terminalBox">
    <div id="terminal" ref="containerElement" />
  </div>
</template>
