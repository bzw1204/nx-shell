import type { App } from 'vue'
import EditorPanel from './EditorPanel.vue'
import FileExplorer from './FileExplorer.vue'
import LeftAction from './LeftAction.vue'
import MxHeader from './MxHeader.vue'
import MxMenus from './MxMenus.vue'
import SystemControl from './SystemControl.vue'
import Watermark from './Watermark.vue'

export { FileExplorer, MxHeader, MxMenus, SystemControl }

export default function install(app: App) {
  app.component('editor', EditorPanel)
  app.component('file-explorer', FileExplorer)
  app.component('left-action', LeftAction)
  app.component('watermark', Watermark)
}
