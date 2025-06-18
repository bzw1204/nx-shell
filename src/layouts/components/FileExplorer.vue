<script setup lang="ts" name="FileExplorer">
import type { TreeOption } from 'naive-ui'
import { AlignBoxBottomCenter } from '@vicons/carbon'
import {
  Folder,
  FolderOpenOutline
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

const pattern = ref('')
const data: TreeOption[] = [
  {
    key: '文件夹',
    label: '个人服务器',
    prefix: () =>
      h(NIcon, null, {
        default: () => h(Folder)
      }),
    children: [
      {
        key: '空的',
        label: '10.10.10.10',
        prefix: () =>
          h(NIcon, null, {
            default: () => h(AlignBoxBottomCenter)
          })
      },
      {
        key: '我的文件',
        label: '我的文件',
        prefix: () =>
          h(NIcon, null, {
            default: () => h(Folder)
          }),
        children: [
          {
            label: 'template.txt',
            key: 'template.txt',
            prefix: () =>
              h(NIcon, null, {
                default: () => h(AlignBoxBottomCenter)
              })
          }
        ]
      }
    ]
  }
]
function nodeProps({ option }: { option: TreeOption }) {
  return {
    onClick() {
      if (!option.children && !option.disabled) {
        window.$message?.info(`[Click] ${option.label}`)
        window.dockview.addPanel({
          id: option.key as string,
          title: option.label,
          component: 'editor'
        })
      }
    }
  }
}
function updatePrefixWithExpaned(_keys: Array<string | number>, _option: Array<TreeOption | null>, meta: {
  node: TreeOption | null
  action: 'expand' | 'collapse' | 'filter'
}) {
  if (!meta.node)
    return
  switch (meta.action) {
    case 'expand':
      meta.node.prefix = () =>
        h(NIcon, null, {
          default: () => h(FolderOpenOutline)
        })
      break
    case 'collapse':
      meta.node.prefix = () =>
        h(NIcon, null, {
          default: () => h(Folder)
        })
      break
  }
}
onMounted(() => {
  // params.api.setSize({ width: 200 })
})
</script>

<template>
  <div class=":uno: p-5">
    <!-- 文件列表 -->
    <n-space vertical :size="12">
      <n-input v-model:value="pattern" placeholder="搜索" />
      <n-tree
        block-line
        expand-on-click
        :indent="14"
        :data="data"
        :node-props="nodeProps"
        :on-update:expanded-keys="updatePrefixWithExpaned"
      />
    </n-space>
  </div>
</template>
