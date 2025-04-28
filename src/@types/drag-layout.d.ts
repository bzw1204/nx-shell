declare module 'drag-layout' {
  // 定义布局区域类型
  type DropZone = 'top' | 'right' | 'bottom' | 'left' | 'center'

  // 定义布局类型
  interface Layout {
    id: string
    type: 'container' | 'panel'
    direction?: 'horizontal' | 'vertical'
    children?: Layout[]
    panelId?: string
    size?: number
  }

  // 定义组件类型
  interface PanelItem {
    id: string
    title: string
    content: string
  }
}
