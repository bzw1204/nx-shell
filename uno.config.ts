import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetRemToPx from '@unocss/preset-rem-to-px'
import { presetWind3 } from '@unocss/preset-wind3'
import { defineConfig, presetAttributify, presetIcons, transformerCompileClass, transformerDirectives, transformerVariantGroup } from 'unocss'

// 生成icons, 用于 unocss safelist，以支持页面动态渲染自定义图标(目前木用) https://github.com/codeErrorSleep/asset-management-admin/blob/e19292500571a94bc7640812d66362b1c6048e7b/fe/build/index.js
export default defineConfig({
  presets: [
    presetRemToPx({ baseFontSize: 4 }),
    presetAttributify(),
    presetWind3(),
    presetIcons({
      autoInstall: false,
      extraProperties: {
        display: 'inline-block',
        width: '1em',
        height: '1em'
      },
      collections: {
        local: FileSystemIconLoader('src/assets/icons', svg => svg.replace(/fill=".*"/, 'fill="currentColor"')),
        color: FileSystemIconLoader('src/assets/color')
      }
    })
  ],
  transformers: [
    transformerCompileClass(),
    transformerDirectives(),
    transformerVariantGroup()
  ],
  rules: [
    [/^wh-(\d+)$/, ([, d]) => ({ width: `${d}px`, height: `${d}px` })],
    ['drag', { '-webkit-app-region': 'drag' }],
    ['no-drag', { '-webkit-app-region': 'no-drag' }]
  ],
  shortcuts: [
    { 'wh-screen': 'w-screen h-screen overflow-hidden' },
    { 'wh-full': 'w-full h-full' },
    { 'h-content': 'h-[calc(100vh-40px)] max-h-[calc(100vh-40px)]' },
    { 'flex-center': 'flex justify-center items-center' },
    { window__control: 'w-34 h-26 min-w-34 min-h26 flex justify-center items-center hover:cursor-pointer' }
  ]
})
