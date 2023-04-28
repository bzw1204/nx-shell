import { defineConfig } from 'windicss/helpers'
export default defineConfig({
  extract: {
    include: ['src/renderer/src/**/*.{vue,html,jsx,tsx}'],
    exclude: ['node_modules', '.git', 'build', 'out', 'resources']
  }
})
